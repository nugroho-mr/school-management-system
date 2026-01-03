import { DailyReports } from '@/collections/DailyReports'
import DailyReportForm from '@/components/forms/dailyReportForm/DailyReportForm'
import ContentHeader from '@/components/layout/ContentHeader'
import { getPayloadClient } from '@/lib/payload'
import { DailyReport } from '@/payload-types'
import { CollectionSlug } from 'payload'
import React from 'react'

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const payload = await getPayloadClient()

  const report = (await payload.findByID({
    collection: DailyReports.slug as CollectionSlug,
    id,
  })) as DailyReport

  const statusBadge =
    report._status === 'draft'
      ? {
          title: 'DRAFT',
          props: {
            className: 'text-black bg-yellow-200 border-yellow-400 font-bold text-yellow-500',
          },
        }
      : {
          title: 'PUBLISHED',
        }

  return (
    <>
      <ContentHeader title="Laporan Harian Siswa" prevPath="/report" badges={[statusBadge]} />
      <section>
        <DailyReportForm curReport={report} />
      </section>
    </>
  )
}

export default page
