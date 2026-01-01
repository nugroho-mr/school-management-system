'use server'

import { z } from 'zod'
import { dailyReportSchema } from '@/schemas/report'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/auth'
import { DailyReports } from '@/collections/DailyReports'
import { CollectionSlug } from 'payload'
import { Students } from '@/collections/Students'
import { Student } from '@/payload-types'
import dayjs from 'dayjs'
import { subDays } from 'date-fns'
import { weekRangeInclusiveStartExclusiveEnd } from '@/lib/date'

export type DailyReport = z.infer<typeof dailyReportSchema>

export type ActionState = { ok: true; id: string } | { ok: false; message: string }

const dailyReportSlug = DailyReports.slug as CollectionSlug
const studentSlug = Students.slug as CollectionSlug

export const submitDailyStudentReport = async (
  reportData: DailyReport,
  isSavingDraft: boolean = false,
  reportId?: string,
): Promise<ActionState> => {
  try {
    const user = await getCurrentUser()
    if (!user) return { ok: false, message: 'Pengguna tidak terotentikasi' }

    const payload = await getPayloadClient()

    const student = String(reportData.student || '')
    const date = String(reportData.date || '')
    const note = String(reportData.note || '')
    const reportType = String(reportData.reportType || '')
    const photoFile = (reportData.photo as File | null) ?? null
    const removePhoto = reportData.removePhoto

    if (!isSavingDraft) {
      const existingReport = await payload.find({
        collection: dailyReportSlug,
        limit: 1,
        where: {
          student: { equals: String(reportData.student || '') },
          date: { equals: String(reportData.date || '') },
          reportType: { equals: String(reportData.reportType || '') },
          id: {
            not_equals: reportId,
          },
        },
      })

      if (existingReport.totalDocs > 0) {
        const student = (await payload.findByID({
          collection: studentSlug,
          id: reportData.student,
          depth: 5,
        })) as Student
        return {
          ok: false,
          message: `Laporan ${reportData.reportType === 'daily' ? 'LGA' : 'montessori'} ${student.fullname} untuk tanggal ${dayjs(reportData.date).locale('id-ID').format('DD MMMM YYYY')} sudah ada.`,
        }
      }

      if (!student || !date || !note || !reportType) {
        return { ok: false, message: 'Data wajib belum diisi' }
      }
    }

    let newPhotoId: string | undefined

    if (photoFile && photoFile.size > 0) {
      // Convert Web File -> Buffer
      const arrayBuffer = await photoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Payload docs show creating docs with uploads from server functions (Local API). :contentReference[oaicite:1]{index=1}
      const createdMedia = await payload.create({
        collection: 'media',
        data: {
          alt: `Daily report photo - ${date}`,
        },
        file: {
          data: buffer,
          mimetype: photoFile.type,
          name: photoFile.name,
          size: photoFile.size,
        },
        user,
      })

      newPhotoId = String(createdMedia.id)

      if (!newPhotoId) {
        return { ok: false, message: 'Gagal mengunggah foto' }
      }
    }

    const photoPatch = newPhotoId ? { photo: newPhotoId } : removePhoto ? { photo: null } : {}

    const data = {
      student,
      date,
      note,
      reportType,
      _status: isSavingDraft ? 'draft' : 'published',
      ...photoPatch,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const result = reportId
      ? await payload.update({
          collection: DailyReports.slug as CollectionSlug,
          id: reportId,
          data,
          user,
          // ...(isSavingDraft ? { draft: true } : {}),
        })
      : await payload.create({
          collection: DailyReports.slug as CollectionSlug,
          data,
          user,
          ...(isSavingDraft ? { draft: true } : {}),
        })

    return { ok: true, id: String(result.id) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, message }
  }
}

type FetchWeekArgs = {
  startISO: string
  endExclusiveISO: string
  limit?: number
}

export const fetchDailyReportsInRange = async (args: FetchWeekArgs) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: DailyReports.slug as CollectionSlug,
    limit: args.limit ?? 9999,
    sort: ['-date'],
    where: {
      and: [
        {
          date: {
            greater_than_equal: args.startISO,
          },
        },
        {
          date: {
            less_than: args.endExclusiveISO,
          },
        },
      ],
    },
    depth: 3,
  })

  return {
    docs: res.docs as unknown as DailyReport[],
    totalDocs: res.totalDocs,
  }
}

export const hasReportOlderThan = async (oldestDateExclusiveISO: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'daily-reports',
    limit: 1,
    sort: '-date',
    where: { date: { less_than: oldestDateExclusiveISO } },
  })

  return res.docs.length > 0
}

export async function loadMoreWeek(oldestLoadedMondayISO: string) {
  // oldestLoadedMondayISO is the Monday (start-of-week) of the current oldest week in the UI
  const currentOldestMonday = new Date(oldestLoadedMondayISO)

  const prevWeekEndInclusive = subDays(currentOldestMonday, 1) // Sunday
  const prevWeekStartInclusive = subDays(currentOldestMonday, 7) // previous Monday

  const { start, endExclusive } = weekRangeInclusiveStartExclusiveEnd(
    prevWeekStartInclusive,
    prevWeekEndInclusive,
  )

  const data = await fetchDailyReportsInRange({
    startISO: start.toISOString(),
    endExclusiveISO: endExclusive.toISOString(),
  })

  // “older than” means older than prevWeekStart (exclusive)
  const showLoadMore = await hasReportOlderThan(start.toISOString())

  return {
    docs: data.docs,
    prevWeekMondayISO: start.toISOString(),
    showLoadMore,
  }
}
