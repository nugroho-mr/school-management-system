'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { id } from 'date-fns/locale'
import { dateStringISO, toMonthKey } from '@/lib/date'
import _ from 'lodash'
import 'dayjs/locale/id'
import { isSameMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import parse from 'html-react-parser'
import dayjs from 'dayjs'
import { FaRegCalendar } from 'react-icons/fa6'
import { Badge } from '@/components/ui/badge'
import { Day } from 'node_modules/react-day-picker/dist/esm/components/custom-components'
import { Button } from '@/components/ui/button'
import { CiFolderOff } from 'react-icons/ci'
import { cn } from '@/lib/utils'
import { fetchStudentReportAvailability, fetchStudentReportByDay } from '@/lib/actions/report'
import { Media } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'

type Availability = Record<string, string[]>
type Report = Record<string, any>

const ReportDiary = () => {
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState<Date>(today)
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [availability, setAvailability] = useState<Availability>({})
  const [reportData, setReportData] = useState<Report>({})

  const [loading, setLoading] = useState(false)

  const isCustomWeekend = (date: Date) => {
    return (date.getDay() === 6 || date.getDay() === 0) && isSameMonth(date, month)
  }

  const loadAvailability = async (targetMonth: Date) => {
    const monthKey = toMonthKey(targetMonth)
    const res = await fetchStudentReportAvailability(monthKey)
    if (!res || !res.ok) {
      throw new Error(res.message || `Gagal menampilkan data laporan untuk bulan ${monthKey}`)
    }
    const data = res.data
    setAvailability(data?.days ?? {})
  }

  const loadDayDetail = async (day: Date) => {
    setLoading(true)
    try {
      const dayKey = dateStringISO(day.toDateString())
      const res = await fetchStudentReportByDay(dayKey)
      if (!res.ok) {
        throw new Error(`Gagal memuat laporan untuk tanggal ${dayKey}: ${res.message}`)
      }
      const data = res.data
      setReportData(data?.reports ?? {})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAvailability(today).catch(console.error)
    loadDayDetail(today).catch(console.error)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
      <div className="md:max-w-70">
        <Card className="border-gray-200">
          <CardContent>
            <p className="text-center text-sm text-primary">
              Pilih tanggal untuk melihat laporan harian
            </p>
            <Calendar
              mode="single"
              className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)] p-0 w-full mt-6"
              locale={id}
              modifiers={{
                customWeekend: isCustomWeekend,
              }}
              modifiersClassNames={{
                customWeekend: 'text-destructive pointer-events-none', // Tailwind styling
              }}
              onSelect={(d) => {
                if (!d) return
                setSelectedDay(d)
                loadDayDetail(d).catch(console.error)
              }}
              onMonthChange={(m) => {
                setMonth(m)
                setAvailability({})
                loadAvailability(m).catch((err) =>
                  console.error('Failed to load availability', err),
                )
              }}
              components={{
                PreviousMonthButton: ({ className, children, ...props }) => {
                  return (
                    <Button className={`${className} md:w-8 md:h-8`} variant="link" {...props}>
                      {children}
                    </Button>
                  )
                },
                NextMonthButton: ({ className, children, ...props }) => {
                  return (
                    <Button className={`${className} md:w-8 md:h-8`} variant="link" {...props}>
                      {children}
                    </Button>
                  )
                },
                MonthCaption: ({ className, children }) => {
                  return <div className={`${className} md:h-8 md:leading-8`}>{children}</div>
                },
                Weekdays: ({ className, children, ...props }) => {
                  return (
                    <thead aria-hidden="true">
                      <tr {...props} className={`${className}  md:inline-flex `}>
                        {children}
                      </tr>
                    </thead>
                  )
                },
                Weekday: ({ children, className, ...props }) => {
                  return (
                    <td {...props} className={`${className} md:w-8 md:h-8 md:leading-8`}>
                      {children}
                    </td>
                  )
                },
                Day: ({ children, className, ...props }) => {
                  return (
                    <td {...props} className={`${className} md:w-8 md:h-8`}>
                      {children}
                    </td>
                  )
                },
                DayButton: ({ className, children, ...props }) => {
                  const key = dateStringISO(props.day.date.toDateString())
                  const count = availability[key]?.length || 0
                  return (
                    <CalendarDayButton className={`${className} md:min-w-[unset]`} {...props}>
                      {children}
                      {count > 0 ? (
                        <span className="text-white bg-chart-5 text-[9px]! rounded-full absolute bottom-1 w-4 h-1 flex items-center justify-center group-data-[focused=true]/day:bg-white group-data-[focused=true]/day:text-foreground "></span>
                      ) : null}
                    </CalendarDayButton>
                  )
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="w-full lg:flex-1">
        <div className="mb-4 flex flex-col gap-4">
          <Card className="bg-primary text-primary-foreground py-4">
            <CardContent className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 ">
                  <FaRegCalendar className="inline-block" />{' '}
                  <span className="inline-block">
                    {dayjs(selectedDay).locale('id').format('dddd, DD MMMM YYYY')}
                  </span>
                </CardTitle>
              </div>
              <div>
                <Badge
                  className={cn(
                    'rounded-sm',
                    Object.entries(reportData).length > 0
                      ? 'bg-chart-5'
                      : 'bg-secondary text-secondary-foreground',
                  )}
                >
                  {Object.entries(reportData).length} laporan
                </Badge>
              </div>
            </CardContent>
          </Card>
          {_.isEmpty(reportData) ? (
            <div className="mt-10">
              <CiFolderOff className="size-30 text-muted-foreground opacity-30 mx-auto" />
              <p className="text-center text-sm mt-2">
                Tidak ada laporan untuk hari{' '}
                <span className="font-bold">
                  {dayjs(selectedDay).locale('id').format('dddd, DD MMMM YYYY')}
                </span>
              </p>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex flex-col gap-4">
                  <ReportCardSkeleton />
                </div>
              ) : (
                Object.entries(reportData).map(([key, report]) => (
                  <Card key={key} className="gap-3 border-primary">
                    <CardContent>
                      <div className="flex gap-3 items-center">
                        <div className="flex-none">
                          <Image
                            src={`${report.student.gender === 'male' ? '/images/propic-male.png' : '/images/propic-female.png'}`}
                            alt="Student Profile Picture"
                            width={50}
                            height={50}
                            className="rounded-full aspect-square object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold m-0 uppercase">
                            {report.student.fullname}
                            <br />
                            <span className="text-xs text-gray-400 font-normal">
                              NIS. {report.student.studentID}
                            </span>
                          </p>
                        </div>
                      </div>

                      <hr className="my-3" />
                      {report.daily && <ReportCard title="Kegiatan Harian" {...report.daily} />}
                      {report.montessori && (
                        <ReportCard title="Kegiatan Montessori" {...report.montessori} />
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ReportCard = ({ title, photo, note }: { title: string; photo?: Media; note: string }) => (
  <Card className="mt-3 pt-0 overflow-hidden">
    <CardHeader className="py-2 text-center bg-muted text-muted-foreground gap-0">
      <p className=" font-bold text-primary">{title}</p>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
        {photo && (
          <div className="sm:w-1/4">
            <Image
              src={typeof photo === 'string' ? photo : photo.url || ''}
              alt="Gambar laporan"
              width={photo.sizes?.thumbnail?.width || 300}
              height={photo.sizes?.thumbnail?.height || 300}
              className="rounded-sm bg-gray-400/50"
            />
          </div>
        )}
        <div className="prose prose-li:leading-tight prose-p:mt-0 prose-p:mb-3 flex-1">
          {parse(note || '')}
        </div>
      </div>
    </CardContent>
  </Card>
)

const ReportCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent>
      <div className="flex gap-3 items-center">
        <div className="flex-none">
          <Skeleton className="rounded-full aspect-square w-12.5 h-12.5" />
        </div>
        <div>
          <Skeleton className="w-32 h-4 mb-2" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <hr className="my-3" />
      <Card className="mt-3 pt-0 overflow-hidden">
        <CardHeader className="py-2 text-center bg-gray-100/30 text-muted-foreground gap-0">
          <Skeleton className="w-24 h-6 mx-auto" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-full h-4 mb-2" />
        </CardContent>
      </Card>
    </CardContent>
  </Card>
)

export default ReportDiary
