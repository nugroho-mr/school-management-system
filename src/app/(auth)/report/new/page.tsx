import DailyReportForm from '@/components/forms/dailyReportForm/DailyReportForm'
import ContentHeader from '@/components/layout/ContentHeader'

const NewReportPage = () => {
  return (
    <>
      <ContentHeader title="Buat Laporan Harian Baru" prevPath="/report" />
      <section>
        <DailyReportForm />
      </section>
    </>
  )
}

export default NewReportPage
