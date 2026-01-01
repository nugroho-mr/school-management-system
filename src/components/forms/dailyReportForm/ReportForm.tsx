'use client'

import { useState, useRef, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { dailyReportSchema } from '@/schemas/report'
import { zodResolver } from '@hookform/resolvers/zod'
import { IoClose } from 'react-icons/io5'
import Image from 'next/image'
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
import { DailyReport, Student } from '@/payload-types'
import { SimpleEditor } from '@/components/text-editor/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { submitDailyStudentReport } from '@/lib/actions/report'
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
import { useRouter } from 'next/navigation'

type FormValues = z.infer<typeof dailyReportSchema>

const dateISODateString = (date?: string): string => {
  const today = date ? new Date(date) : new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMediaThumbUrl = (photo: any): string | null => {
  if (!photo) return null
  if (typeof photo === 'string') return null
  const thumb = photo?.sizes?.thumbnail?.url
  const url = photo?.url
  return (thumb || url || null) as string | null
}

export const ReportForm = ({
  students,
  defaultValues,
}: {
  students: Student[]
  defaultValues?: DailyReport
}) => {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [selectedStudentName, setSelectedStudentName] = useState<string>('')
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const existingPhotoUrl = getMediaThumbUrl(defaultValues?.photo)

  useEffect(() => {
    setSelectedStudentName(() => {
      const studentId =
        typeof defaultValues?.student === 'object'
          ? defaultValues.student?.id
          : defaultValues?.student
      const currentStudent = students.find((student) => student.id === studentId)
      return currentStudent?.fullname || ''
    })
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      student: typeof defaultValues?.student === 'object' ? defaultValues.student.id : '',
      date: defaultValues?.date ? dateISODateString(defaultValues.date) : dateISODateString(),
      note: defaultValues?.note || '',
      reportType: defaultValues?.reportType || 'daily',
      photo: null,
      photoUrl: existingPhotoUrl,
      photoId: typeof defaultValues?.photo === 'object' ? defaultValues?.photo?.id : null,
      removePhoto: false,
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleSaveDraft = async () => {
    const { getValues } = form
    const currentData = getValues()
    try {
      const res = await submitDailyStudentReport(currentData, true, defaultValues?.id)
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      toast.success('Berhasil mengimpan laporan sebagai draf.')
      if (defaultValues?.id) {
        router.refresh()
      } else {
        router.push(`/report/${res.id}`)
      }
    } catch (error) {
      toast.error('Maaf ada masalah dalam menyimpan laporan. Cobalah beberapa saat lagi.')
      console.error('Error submitting report: ', error)
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
      const res = await submitDailyStudentReport(formData, false, defaultValues?.id)

      if (!res.ok) {
        toast.error(res.message)
        return
      }

      toast.success('Laporan siswa berhasil diterbitkan.')
      setConfirmationOpen(false)
      if (defaultValues?.id) {
        router.refresh()
      } else {
        router.push(`/report/${res.id}`)
      }
    } catch (error) {
      toast.error('Maaf ada masalah dalam menyimpan laporan. Cobalah beberapa saat lagi.')
      console.error('Error submitting report: ', error)
    }
  }

  const onNoteChangeHandle = (content: string) => {
    form.setValue('note', content)
  }

  const removePhoto = form.watch('removePhoto')
  const photoUrl = form.watch('photoUrl')
  const activePreview = imagePreview || (!removePhoto ? photoUrl : null)

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
                      <Input type="date" max={dateISODateString()} {...field} />
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

                          if (imagePreview) URL.revokeObjectURL(imagePreview)

                          form.setValue('photo', file || null)
                          form.setValue('removePhoto', false)
                          const imageUrl = URL.createObjectURL(file)
                          setImagePreview(imageUrl)
                        }}
                      />
                    </FormControl>
                    {activePreview && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-center text-gray-700 mb-2">
                          {imagePreview ? 'preview' : 'foto saat ini'}
                        </p>
                        <div className="relative w-full max-w-[200px] h-[200px] mx-auto">
                          <button
                            className="hover:cursor-pointer text-gray-500 border border-gray-500 p-0 inline-flex items-center text-xs gap-1 whitespace-nowrap bg-white px-2 py-1 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors absolute top-2 right-2 z-[2]"
                            onClick={(e) => {
                              e.preventDefault()
                              if (imagePreview) {
                                URL.revokeObjectURL(imagePreview)
                                setImagePreview(null)
                                form.setValue('photo', null)

                                if (fileRef.current?.value) fileRef.current.value = ''
                                return
                              }

                              // Case B: mark existing DB photo for removal
                              if (photoUrl) {
                                form.setValue('removePhoto', true)
                                // keep photoUrl as-is (for undo); activePreview will become null
                                if (fileRef.current?.value) fileRef.current.value = ''
                              }
                            }}
                          >
                            <IoClose /> {imagePreview ? 'batal' : 'hapus foto'}
                          </button>

                          <Image
                            src={activePreview}
                            alt="Preview"
                            className="w-full h-full rounded-md relative z-0 object-contain bg-gray-900"
                            width={200}
                            height={200}
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
            {defaultValues?.id && defaultValues?._status === 'published' ? 'Perbarui' : 'Terbitkan'}
          </Button>
        </li>
        <li className="sm:order-1">
          <Button
            variant="outline"
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-unset"
          >
            {defaultValues?._status === 'published' ? 'Ubah menjadi draf' : 'Simpan draf'}
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
            {defaultValues?._status === 'published' ? 'Ubah menjadi draf' : 'Simpan draf'}
          </Button>
          <Button type="submit" form="new-daily-report-form">
            {defaultValues?.id && defaultValues?._status === 'published' ? 'Perbarui' : 'Terbitkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
