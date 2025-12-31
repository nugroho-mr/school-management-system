import { getCurrentStudents } from '@/data/students'
import NewDailyReportForm from '@/components/forms/NewDailyReportForm'
import ContentHeader from '@/components/layout/ContentHeader'

const NewReportPage = async () => {
  const students = await getCurrentStudents()

  return (
    <>
      <ContentHeader title="Buat Laporan Harian Baru" prevPath="/dashboard" />
      <div>
        <NewDailyReportForm students={students} />
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
