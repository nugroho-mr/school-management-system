import React from 'react'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { getCurrentStudents } from '@/data/students'
import NewDailyReportForm from '@/components/forms/NewDailyReportForm'

const newReportPage = async () => {
  const students = await getCurrentStudents()
  return (
    <div>
      <NewDailyReportForm students={students} />
    </div>
    // <div className="w-[500px] max-w-full h-[250px]">
    //   <SimpleEditor
    //     onChangeHandler={(html: string) => {
    //       console.log(html)
    //     }}
    //   />
    // </div>
  )
}

export default newReportPage
