'use server'

import { z } from 'zod'
import { dailyReportSchema } from '@/schemas/report'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUser } from '@/lib/auth'
import { DailyReports } from '@/collections/DailyReports'
import { CollectionSlug } from 'payload'
import { Students } from '@/collections/Students'
import { Student } from '@/payload-types'
import { jakartaMonthRange, dateStringISO, jakartaDayRange } from '../date'
import { normalizeUserRole } from '../user'
import { hasMatchRole } from '@/utils/lib'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type DailyReport = z.infer<typeof dailyReportSchema>
type ActionState = { ok: true; id: string } | { ok: false; message: string }
type FetchWeekArgs = {
  startISO: string
  endISO: string
  limit?: number
}

const dailyReportSlug = DailyReports.slug as CollectionSlug
const studentSlug = Students.slug as CollectionSlug

export const submitDailyStudentReport = async (
  reportData: DailyReport,
  isSavingDraft: boolean = false,
  reportId?: string,
): Promise<ActionState> => {
  const MAX_PHOTO_SIZE = 1 * 1024 * 1024 // 1MB
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']

  try {
    const user = await getCurrentUser()
    if (!user) return { ok: false, message: 'Pengguna tidak terotentikasi' }

    const parsed = isSavingDraft
      ? dailyReportSchema.partial().safeParse(reportData)
      : dailyReportSchema.safeParse(reportData)
    if (!parsed.success) {
      return { ok: false, message: 'Validasi data gagal. Data tidak valid.' }
    }

    const validatedData = parsed.data

    const payload = await getPayloadClient()

    const student = String(validatedData.student || '')
    const date = String(validatedData.date || '')
    const note = String(validatedData.note || '')
    const reportType = String(validatedData.reportType || '')
    const photoFile = (validatedData.photo as File | null) ?? null
    const removePhoto = validatedData.removePhoto

    if (!isSavingDraft) {
      const existingReport = await payload.find({
        collection: dailyReportSlug,
        limit: 1,
        where: {
          student: { equals: student },
          date: { equals: date },
          reportType: { equals: reportType },
          id: {
            not_equals: reportId,
          },
        },
      })

      if (existingReport.totalDocs > 0) {
        const targetStudent = (await payload.findByID({
          collection: studentSlug,
          id: student,
          depth: 5,
        })) as Student
        return {
          ok: false,
          message: `Laporan ${reportType === 'daily' ? 'LGA' : 'montessori'} ${targetStudent.fullname} untuk tanggal ${format(new Date(date), 'dd MMMM yyyy', { locale: id })} sudah ada.`,
        }
      }
    }

    let newPhotoId: string | undefined

    if (photoFile && photoFile.size > 0) {
      // Convert Web File -> Buffer
      if (photoFile.size > MAX_PHOTO_SIZE) {
        return { ok: false, message: 'Ukuran foto terlalu besar. Maksimal 1MB.' }
      }
      if (!ALLOWED_MIME_TYPES.includes(photoFile.type)) {
        return {
          ok: false,
          message: 'Tipe file tidak didukung. Hanya JPEG atau PNG yang diperbolehkan.',
        }
      }
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

export const fetchDailyReportsInRange = async (args: FetchWeekArgs) => {
  const MAX_LIMIT = 500
  const limit = Math.min(args.limit ?? MAX_LIMIT, MAX_LIMIT)
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: DailyReports.slug as CollectionSlug,
    limit,
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
            less_than_equal: args.endISO,
          },
        },
      ],
    },
    depth: 1,
  })

  return {
    docs: res.docs as unknown as DailyReport[],
    totalDocs: res.totalDocs,
    hasMore: res.totalDocs > limit,
  }
}

export const fetchStudentReportAvailability = async (month: string) => {
  const payload = await getPayloadClient()
  const user = await getCurrentUser()

  if (!user) return { ok: false, message: 'Pengguna tidak terotentikasi.' }

  const isAdministrator = user.collection === 'admins'

  const permitedRole = ['parent']
  const isPermitedUser = hasMatchRole(permitedRole, normalizeUserRole(user?.role))

  if (!isAdministrator && !isPermitedUser) {
    return { ok: false, message: 'Pengguna tidak terotorisasi untuk mengakses data laporan siswa.' }
  }

  const monthRegex = /^\d{4}-\d{2}$/
  if (!month || !monthRegex.test(month)) {
    return {
      ok: false,
      message: 'Format penanggalan salah. Gunakan YYYY-MM.',
      status: 400,
    }
  }

  try {
    const familyRes = await payload.find({
      collection: 'families',
      where: { parents: { contains: user?.id } },
      depth: 2,
      limit: 10,
    })

    if (familyRes === undefined) {
      return {
        ok: false,
        message: 'Gagal mencari keluarga pengguna.',
      }
    }

    const families = familyRes?.docs
    const studentIds = families.flatMap((f: any) =>
      (f.students || []).map((s: any) => (typeof s === 'string' ? s : s.id)),
    )

    if (studentIds.length === 0) return { ok: true, data: { month, days: {} } }

    const { start, end } = jakartaMonthRange(month)

    const reportRes = await payload.find({
      collection: 'daily-reports',
      where: {
        and: [
          { student: { in: studentIds } },
          {
            date: {
              greater_than_equal: start,
            },
          },
          {
            date: {
              less_than: end,
            },
          },
        ],
      },
      depth: 0,
      limit: 500,
      sort: 'date',
    })

    const days: Record<string, string[]> = {}

    for (const report of reportRes?.docs || []) {
      const studentId = typeof report.student === 'string' ? report.student : report.student.id
      const key = dateStringISO(report.date)
      if (!days[key]) {
        days[key] = []
      }
      if (!days[key].includes(studentId)) {
        days[key].push(studentId)
      }
    }

    return { ok: true, data: { month, days } }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'There is an unknown error. Try again later.'
    return {
      ok: false,
      message,
    }
  }
}

export const fetchStudentReportByDay = async (day: string) => {
  const payload = await getPayloadClient()
  const user = await getCurrentUser()

  if (!user) return { ok: false, message: 'Pengguna tidak terotentikasi.' }

  const isAdministrator = user.collection === 'admins'

  const permitedRole = ['parent']
  const isPermitedUser = hasMatchRole(permitedRole, normalizeUserRole(user?.role))

  if (!isAdministrator && !isPermitedUser) {
    return { ok: false, message: 'Pengguna tidak terotorisasi untuk mengakses data laporan siswa.' }
  }

  const dayRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!day || !dayRegex.test(day)) {
    return {
      ok: false,
      message: 'Format tanggal salah. Gunakan YYYY-MM-DD.',
    }
  }

  try {
    const familyRes = await payload.find({
      collection: 'families',
      where: { parents: { contains: user?.id } },
      depth: 1,
      limit: 10,
    })

    const families = familyRes?.docs
    const studentIds = families.flatMap((f: any) =>
      (f.students || []).map((s: any) => (typeof s === 'string' ? s : s.id)),
    )

    if (studentIds.length === 0) {
      return {
        ok: true,
        data: { day, reports: {} },
      }
    }

    const { start, end } = jakartaDayRange(day)

    const reportRes = await payload.find({
      collection: 'daily-reports',
      where: {
        and: [
          { student: { in: studentIds } },
          {
            date: {
              greater_than_equal: start,
            },
          },
          {
            date: {
              less_than_equal: end,
            },
          },
        ],
      },
      depth: 2,
      limit: 500,
      sort: 'student.fullname',
    })

    const normalizedReports: Record<string, any> = {}

    for (const report of reportRes?.docs || []) {
      const studentId = typeof report.student === 'string' ? report.student : report.student.id
      if (!normalizedReports[studentId]) {
        normalizedReports[studentId] = {
          date: report.date,
          student: report.student,
        }
      }
      normalizedReports[studentId][report.reportType] = {
        note: report.note,
        ...(report.photo && { photo: report.photo }),
      }
    }

    return {
      ok: true,
      data: { day, reports: normalizedReports },
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'There is an unknown error. Try again later.'
    return {
      ok: false,
      message,
    }
  }
}
