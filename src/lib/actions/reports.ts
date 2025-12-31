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

export type DailyReport = z.infer<typeof dailyReportSchema>

export type ActionState = { ok: true; id: string } | { ok: false; message: string }

const dailyReportSlug = DailyReports.slug as CollectionSlug
const studentSlug = Students.slug as CollectionSlug

export const submitDailyStudentReport = async (
  reportData: DailyReport,
  isSavingDraft: boolean = false,
): Promise<ActionState> => {
  try {
    const user = await getCurrentUser()
    if (!user) return { ok: false, message: 'Pengguna tidak terotentikasi' }

    const payload = await getPayloadClient()

    const student = String(reportData.student || '')
    const date = String(reportData.date || '')
    const note = String(reportData.note || '')
    const reportType = String(reportData.reportType || '')
    const photoFile = reportData.photo as File | null

    if (!isSavingDraft) {
      const existingReport = await payload.find({
        collection: dailyReportSlug,
        limit: 1,
        where: {
          student: { equals: String(reportData.student || '') },
          date: { equals: String(reportData.date || '') },
          reportType: { equals: String(reportData.reportType || '') },
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

    let photoId: string | undefined

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

      photoId = String(createdMedia.id)

      if (!photoId) {
        return { ok: false, message: 'Gagal mengunggah foto' }
      }
    }

    const createdReport = await payload.create({
      collection: DailyReports.slug as CollectionSlug,
      data: {
        student,
        date,
        note,
        reportType,
        ...(photoId ? { photo: photoId } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      user,
      ...(isSavingDraft ? { draft: true } : {}),
    })

    return { ok: true, id: String(createdReport.id) }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, message }
  }
}
