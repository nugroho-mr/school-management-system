import ContentHeader from '@/components/layout/ContentHeader'
import DailyReportList from '@/components/module/report/DailyReportList'

const DailyReportPage = async () => {
  return (
    <>
      <ContentHeader title="Laporan Harian" prevPath="/dashboard" />

      <section>
        <DailyReportList />
      </section>
    </>
  )
}

export default DailyReportPage
