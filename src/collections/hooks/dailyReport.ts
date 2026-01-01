import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionSlug } from 'payload'
import { DailyReports } from '@/collections/DailyReports'

export const setCreatedBy: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (!req.user) throw new Error('Anda tidak memiliki otorisasi')
  if (operation === 'create') {
    data.createdBy = {
      relationTo: req.user.collection,
      value: req.user.id,
    }
  }
  return data
}

export const validateUniquePublishedReport: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const student = data.student ?? originalDoc?.student
  const date = data.date ?? originalDoc?.date
  const reportType = data.reportType ?? originalDoc?.reportType

  // If key fields not complete, don't run check (especially useful for drafts/partial updates)
  if (!student || !date || !reportType) return data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    student: { equals: student },
    date: { equals: date },
    reportType: { equals: reportType },
    _status: { equals: 'published' },
  }

  // Exclude the current doc when updating
  if (operation === 'update' && originalDoc?.id) {
    where.id = { not_equals: originalDoc.id }
  }

  const res = await req.payload.find({
    collection: DailyReports.slug as CollectionSlug,
    where,
    limit: 1,
    draft: true,
  })

  if (res.totalDocs > 0) {
    throw new Error(`Laporan ${reportType} untuk siswa ini pada tanggal tersebut sudah ada`)
  }

  return data
}

export const validateDateNotInFuture: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
}) => {
  const date = data.date ?? originalDoc?.date
  if (!date) return data

  const dateSubmitted = new Date(date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (dateSubmitted.getTime() > today.getTime()) {
    throw new Error('Tanggal laporan tidak boleh lebih dari hari ini')
  }

  return data
}

export const deleteOldPhotoOnPublish: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Only act when resulting doc is published
  // Payload drafts use `_status` = 'draft' | 'published'
  if (doc?._status !== 'published') return doc

  // If there was no previous doc (create), nothing to delete
  if (!previousDoc) return doc

  const prevPhoto =
    typeof previousDoc.photo === 'object' ? previousDoc.photo?.id : previousDoc.photo
  const nextPhoto = typeof doc.photo === 'object' ? doc.photo?.id : doc.photo

  // If photo didn't change, nothing to do
  if (!prevPhoto || prevPhoto === nextPhoto) return doc

  // If photo was removed OR replaced, delete the old media doc.
  // S3 deletion should happen via your storage adapter when media doc is deleted.
  try {
    await req.payload.delete({
      collection: 'media',
      id: String(prevPhoto),
      overrideAccess: true,
      // user: req.user, // optional
    })
  } catch (e) {
    // optional: log but don't break publishing
    req.payload.logger.warn(
      `Failed to delete old media ${String(prevPhoto)} after publish: ${
        e instanceof Error ? e.message : String(e)
      }`,
    )
  }

  return doc
}
