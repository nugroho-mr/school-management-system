'use client'

import { useState, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { dailyReportSchema } from '@/schemas/report'
import { zodResolver } from '@hookform/resolvers/zod'
import { IoClose } from 'react-icons/io5'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Student } from '@/payload-types'
import { SimpleEditor } from '@/components/text-editor/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { submitDailyStudentReport } from '@/lib/actions/reports'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { toast } from 'sonner'
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type FormValues = z.infer<typeof dailyReportSchema>

const todayISODateString = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const NewDailyReportForm = ({ students }: { students: Student[] }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState<string>('')

  const [confirmationOpen, setConfirmationOpen] = useState(false)

  const fileRef = useRef<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      student: '',
      date: todayISODateString(),
      note: '',
      photo: null,
    },
    mode: 'onSubmit',
    // reValidateMode: 'onSubmit'
  })

  const handleSaveDraft = async () => {
    const { getValues } = form
    const currentData = getValues()
    try {
      const res = await submitDailyStudentReport(currentData, true)
      console.log(res)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const openConfirmationDialog = async () => {
    const validateOk = await form.trigger()
    if (!validateOk) {
      return
    }
    setConfirmationOpen(true)
  }

  const submitForm = async (formData: FormValues) => {
    try {
      const res = await submitDailyStudentReport(formData)

      if (!res.ok) {
        toast.error(res.message)
      }

      console.log('Submit report response:', res)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      console.log('Form submission completed')
    }
  }

  const onNoteChangeHandle = (content: string) => {
    form.setValue('note', content)
  }

  return (
    <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
      <Form {...form}>
        <form id="new-daily-report-form" onSubmit={form.handleSubmit(submitForm)}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            <div>
              <FormField
                control={form.control}
                name="student"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Siswa</FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value)

                            console.log(e.target)
                            setSelectedStudentName(e.target.selectedOptions[0].textContent.trim())
                          }}
                        >
                          <NativeSelectOption value="">-- pilih siswa --</NativeSelectOption>
                          {students.map((student) => (
                            <NativeSelectOption key={student.id} value={student.id}>
                              {student.fullname}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" max={todayISODateString()} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Laporan</FormLabel>
                    <NativeSelect
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <NativeSelectOption value="">-- pilih jenis laporan --</NativeSelectOption>
                      <NativeSelectOption value="daily">Laporan LGA</NativeSelectOption>
                      <NativeSelectOption value="montessori">Laporan Montessori</NativeSelectOption>
                    </NativeSelect>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <SimpleEditor content={field.value} onChangeHandler={onNoteChangeHandle} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-1">
              <FormField
                control={form.control}
                name="photo"
                render={({ field: _field }) => (
                  <FormItem>
                    <FormLabel>Foto</FormLabel>

                    <FormControl>
                      <Input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          form.setValue('photo', file || null)
                          const imageUrl = URL.createObjectURL(file)
                          setImagePreview(imageUrl)
                        }}
                      />
                    </FormControl>
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-center text-gray-700 mb-2">preview</p>
                        <div className="relative w-full max-w-[200px] h-[200px] mx-auto">
                          {fileRef.current?.value && (
                            <button
                              className="hover:cursor-pointer text-gray-500 border border-gray-500 p-0 inline-flex items-center text-xs gap-1 whitespace-nowrap bg-white px-2 py-1 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors absolute top-2 right-2 z-[2]"
                              onClick={(e) => {
                                e.preventDefault()
                                setImagePreview(null)
                                if (fileRef.current?.value) {
                                  fileRef.current.value = null
                                }
                              }}
                            >
                              <IoClose /> hapus foto
                            </button>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full rounded-md relative z-0 object-contain bg-gray-900"
                          />
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>

      <ul className="flex flex-col mt-10 gap-3 sm:flex-row sm:justify-end">
        <li className="sm:order-2">
          <Button type="button" onClick={openConfirmationDialog} className="w-full sm:w-unset">
            Simpan
          </Button>
        </li>
        <li className="sm:order-1">
          <Button
            variant="outline"
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-unset"
          >
            Simpan sebagai draft
          </Button>
        </li>
      </ul>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Menambahkan Laporan Harian</DialogTitle>
          <DialogDescription>Pastikan data berikut sudah benar</DialogDescription>
        </DialogHeader>
        <ul className="text-sm">
          <li>
            Nama Siswa: <b>{selectedStudentName}</b>
          </li>
          <li>
            Tanggal: <b>{dayjs(form.getValues().date).locale('id-ID').format('DD MMMM YYYY')}</b>
          </li>
          <li>
            Laporan:{' '}
            <b>
              {form.getValues().reportType === 'daily'
                ? 'LGA'
                : form.getValues().reportType === 'montessori'
                  ? 'Montessori'
                  : ''}
            </b>
          </li>
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={handleSaveDraft}>
            Simpan sebagai draf
          </Button>
          <Button type="submit" form="new-daily-report-form">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewDailyReportForm
