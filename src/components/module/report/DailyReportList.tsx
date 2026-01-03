'use client'

import { useEffect, useState } from 'react'

import { DailyReport } from '@/payload-types'
import { closestPreviousMonday, dateStringISO } from '@/lib/date'
import { DailyReportSection, groupReportsByDate } from '@/lib/report'
import { fetchDailyReportsInRange } from '@/lib/actions/report'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import clsx from 'clsx'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

import { CiViewList } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa6'
import { FiEdit3 } from 'react-icons/fi'

import Link from 'next/link'
import Image from 'next/image'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'

const filterFormSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  student: z.string().optional(),
  reportType: z.string().optional(),
})

const DailyReportList = () => {
  const [sections, setSections] = useState<DailyReportSection[] | null>(null)
  const [displayedReport, setDisplayedReport] = useState<DailyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getReport = async (startDate: string, endDate: string) => {
    const initialReport = await fetchDailyReportsInRange({
      startISO: startDate,
      endISO: endDate,
    })
    setDisplayedReport(initialReport.docs as unknown as DailyReport[])
  }

  useEffect(() => {
    getReport(dateStringISO(closestPreviousMonday(new Date()).toDateString()), dateStringISO())
  }, [])

  useEffect(() => {
    const groupedReport = groupReportsByDate(displayedReport)
    setSections(groupedReport)
  }, [displayedReport])

  useEffect(() => {
    setIsLoading(false)
  }, [sections])

  const filterForm = useForm<z.infer<typeof filterFormSchema>>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      startDate: dateStringISO(closestPreviousMonday(new Date()).toDateString()),
      endDate: dateStringISO(),
      student: '',
      reportType: '',
    },
  })

  const startDateValue = filterForm.watch('startDate')

  const filterSubmitHandler = (formData: z.infer<typeof filterFormSchema>) => {
    setIsLoading(true)
    getReport(formData.startDate, formData.endDate)
  }

  return (
    <div>
      <div className="flex flex-col-reverse gap-6 mb-10 md:flex-row md:justify-between md:items-center">
        <div>
          <Form {...filterForm}>
            <form onSubmit={filterForm.handleSubmit(filterSubmitHandler)}>
              <div className="flex flex-col gap-4 lg:flex-row md:gap-2 md:items-center">
                <p className="text-sm text-neutral-500 md:mt-5">Filter laporan siswa</p>
                <FormField
                  control={filterForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mulai tanggal</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          max={dateStringISO()}
                          min={dateStringISO('07-01-2025')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={filterForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sampai tanggal</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} max={dateStringISO()} min={startDateValue} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Button type="submit" variant="secondary" className="w-full md:w-unset md:mt-6">
                    Filter
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
        <div>
          <Link href="/report/new">
            <Button size="sm" className="w-full md:w-unset md:mt-6">
              <FaPlus /> Laporan Baru
            </Button>
          </Link>
        </div>
      </div>
      <Separator orientation="horizontal" className="border-b border-neutral-200 mb-10" />
      {isLoading || sections === null ? (
        <DisplaySkeleton />
      ) : sections.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CiViewList />
            </EmptyMedia>
            <EmptyTitle>Tidak Ada Laporan</EmptyTitle>
            <EmptyDescription>Saat ini belum ada laporan harian yang tersedia.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/report/new">
              <Button>Buat laporan baru</Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="space-y-10">
          {sections.map((section) => {
            return (
              <li key={section.dateKey}>
                <h2 className="mb-4 text-sm font-bold text-secondary-foreground">
                  {dayjs(new Date(section.dateKey)).locale('id').format('dddd, DD MMMM YYYY')}
                </h2>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader className="bg-accent">
                      <TableRow className="font-bold">
                        <TableHead>Siswa</TableHead>
                        <TableHead className="text-center w-[150px]">Jenis Laporan</TableHead>
                        <TableHead className="text-center w-[70px]">Foto</TableHead>
                        <TableHead className="text-center w-[120px]">Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.rows.map((report) => (
                        <TableRow
                          key={report.id}
                          className={clsx(
                            report._status === 'draft' && 'bg-amber-50 hover:bg-amber-100',
                          )}
                        >
                          <TableCell>
                            {typeof report.student === 'string'
                              ? report.student
                              : (report.student?.fullname ?? report.student?.id ?? '-')}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {report.reportType === 'daily' ? (
                              <span className="text-blue-500">LGA</span>
                            ) : report.reportType === 'montessori' ? (
                              <span className="text-pink-500">Montessori</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {typeof report.photo === 'object' ? (
                              <Image
                                src={
                                  report.photo?.sizes?.thumbnail?.url || report.photo?.url || '#'
                                }
                                alt="foto laporan"
                                width={20}
                                height={20}
                                className="object-cover aspect-square rounded-full inline-block"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {report._status ? (
                              <Badge
                                className={clsx(
                                  'uppercase text-[10px] font-bold',
                                  report._status === 'draft' &&
                                    'bg-yellow-200 border-yellow-400 text-yellow-500',
                                )}
                              >
                                {report._status === 'draft' ? 'Draft' : 'Published'}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Link href={`/report/${report.id}`}>
                              <Button variant="outline" size="icon-sm" title="Edit">
                                <FiEdit3 />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default DailyReportList

const DisplaySkeleton = () => (
  <div className="space-y-10">
    <div>
      <Skeleton className="h-4 w-40 rounded-md mb-4" />
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
    <div>
      <Skeleton className="h-4 w-40 rounded-md mb-4" />
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
    <div>
      <Skeleton className="h-4 w-40 rounded-md mb-4" />
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
  </div>
)
