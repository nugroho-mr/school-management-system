import {
  type CollectionBeforeValidateHook,
  type CollectionAfterChangeHook,
  ValidationError,
} from 'payload'

const makeFamilyCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const codeLength = 5
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < codeLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return `CW-${result}`
}

// Create a unique family code if not provided during creation or update of a Family document
export const validateFamilyCode: CollectionBeforeValidateHook = async ({ data }) => {
  if (data && !data.familyCode) {
    data.familyCode = makeFamilyCode()
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
        console.log(`Student ${s.id} currently belongs to family ${existingFamilyId}`)
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
      req.payload.update({
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
      req.payload.update({
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
