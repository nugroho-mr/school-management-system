import ContentHeader from '@/components/layout/ContentHeader'
import ReportDiary from '@/components/module/report/ReportDiary'

const studentDiaryPage = async () => {
  return (
    <>
      <ContentHeader title="Laporan Harian" prevPath="/dashboard" />
      <section>
        <ReportDiary />
      </section>
    </>
  )
}

export default studentDiaryPage
