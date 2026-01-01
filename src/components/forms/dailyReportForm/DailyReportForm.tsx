import { getCurrentStudents } from '@/data/students'
import { ReportForm } from './ReportForm'
import { DailyReport } from '@/payload-types'

const DailyReportForm = async ({ curReport }: { curReport?: DailyReport }) => {
  const students = await getCurrentStudents()
  return <ReportForm students={students} {...(curReport && { defaultValues: curReport })} />
}

export default DailyReportForm
