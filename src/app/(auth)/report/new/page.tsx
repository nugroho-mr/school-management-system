import DailyReportForm from '@/components/forms/dailyReportForm/DailyReportForm'
import ContentHeader from '@/components/layout/ContentHeader'

const NewReportPage = () => {
  return (
    <>
      <ContentHeader title="Buat Laporan Harian Baru" prevPath="/report" />
      <div>
        <DailyReportForm />
      </div>
    </>
    // <div className="w-[500px] max-w-full h-[250px]">
    //   <SimpleEditor
    //     onChangeHandler={(html: string) => {
    //       console.log(html)
    //     }}
    //   />
    // </div>
  )
}

export default NewReportPage
