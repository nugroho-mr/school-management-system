import {
  type CollectionBeforeValidateHook,
  type CollectionAfterChangeHook,
  ValidationError,
} from 'payload'
import crypto from 'crypto'

const makeFamilyCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const familyCodeLength = 6
  const bytes = crypto.randomBytes(familyCodeLength)
  let result = ''
  for (let i = 0; i < familyCodeLength; i++) {
    result += characters[bytes[i] % characters.length]
  }
  return `CW-${result}`
}

// Create a unique family code if not provided during creation or update of a Family document
export const validateFamilyCode: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (data && !data.familyCode) {
    let code: string
    let attempts = 0

    do {
      code = makeFamilyCode()
      const existing = await req.payload.find({
        collection: 'families',
        where: { familyCode: { equals: code } },
        limit: 1,
      })
      if (existing.totalDocs === 0) break
      attempts++
    } while (attempts < 5)
    if (attempts === 5) {
      throw new Error(
        'Failed to generate a unique family code after multiple attempts. Please try again.',
      )
    }
    data.familyCode = code
  }
  return data
}

// Sync Students' family field when a Family document is created or updated
const normalizeIds = (arr: any[]): string[] => {
  return arr.map((v) => (typeof v === 'string' ? v : v.id))
}

const getRelId = (v: any) => (typeof v === 'string' ? v : v?.id)

export const syncStudentsFamily: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const familyId = doc.id
  const currentStudentIds: string[] = normalizeIds(doc.students || [])
  const previousStudentIds: string[] = normalizeIds(previousDoc?.students || [])

  const addedStudentIds = currentStudentIds.filter((id) => !previousStudentIds.includes(id))
  const removedStudentIds = previousStudentIds.filter((id) => !currentStudentIds.includes(id))

  if (addedStudentIds.length) {
    const addedStudents = await req.payload.find({
      collection: 'students',
      where: { id: { in: addedStudentIds } },
      limit: addedStudentIds.length,
      overrideAccess: true,
      depth: 0,
    })

    const conflicts = addedStudents.docs
      .map((s: { id: string }) => {
        const existingFamilyId = getRelId((s as any).family)
        if (existingFamilyId && existingFamilyId !== familyId) {
          return { studentId: s.id, existingFamilyId }
        }
        return null
      })
      .filter(Boolean) as { studentId: string; existingFamilyId: string }[]

    if (conflicts.length) {
      throw new ValidationError({
        collection: 'families',
        errors: conflicts.map((c) => ({
          path: 'students',
          message: `Student ${c.studentId} already belongs to family ${c.existingFamilyId}. Remove it from that family first.`,
        })),
      })
    }
  }

  await Promise.all(
    addedStudentIds.map(async (studentId) => {
      await req.payload.update({
        collection: 'students',
        id: studentId,
        data: {
          family: familyId,
        },
        overrideAccess: true,
      })
    }),
  )

  await Promise.all(
    removedStudentIds.map(async (studentId) => {
      await req.payload.update({
        collection: 'students',
        id: studentId,
        data: {
          family: null,
        },
        overrideAccess: true,
      })
    }),
  )

  return doc
}
