import { notFound } from 'next/navigation'
import { DailyReports } from '@/collections/DailyReports'
import DailyReportForm from '@/components/forms/dailyReportForm/DailyReportForm'
import ContentHeader from '@/components/layout/ContentHeader'
import { getPayloadClient } from '@/lib/payload'
import { DailyReport } from '@/payload-types'
import { CollectionSlug } from 'payload'

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  if (!id || typeof id !== 'string' || id.trim().length < 1) {
    notFound()
  }
  const payload = await getPayloadClient()

  let report: DailyReport

  try {
    report = (await payload.findByID({
      collection: DailyReports.slug as CollectionSlug,
      id,
    })) as DailyReport
  } catch (error) {
    notFound()
  }

  if (!report) {
    notFound()
  }

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
