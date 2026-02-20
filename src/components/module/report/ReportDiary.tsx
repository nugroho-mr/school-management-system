'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { id } from 'date-fns/locale'
import { dateStringISO, toMonthKey } from '@/lib/date'
import { set } from 'date-fns'

type Availability = Record<string, { count: number }>

const ReportDiary = () => {
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState<Date>(today)
  const [availability, setAvailability] = useState<Availability>({})

  const loadAvailability = async (targetMonth: Date) => {
    const monthKey = toMonthKey(targetMonth)
    const res = await fetch(`/ap/parent/reports/availability?month=${monthKey}`)
    if (!res.ok) {
      throw new Error(
        `Failed to load availability for month ${monthKey}: ${res.status} ${res.statusText}`,
      )
    }
    const data = await res.json()
    setAvailability(data.days ?? {})
  }

  useEffect(() => {
    loadAvailability(month).catch(console.error)
  }, [])

  return (
    <Calendar
      mode="single"
      className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
      locale={id}
      onMonthChange={(m) => {
        setMonth(m)
        setAvailability({})
        loadAvailability(m).catch((err) => console.error('Failed to load availability', err))
      }}
      components={{
        DayButton: (props) => {
          const key = dateStringISO(props.day.date.toDateString())
          const count = availability[key]?.count || 0
          return (
            <CalendarDayButton {...props}>
              {props.children}
              {count > 0 ? (
                <span className="text-white bg-foreground text-[9px]! rounded-full absolute bottom-0 w-4 h-4 flex items-center justify-center group-data-[focused=true]/day:bg-white group-data-[focused=true]/day:text-foreground">
                  {count > 1 ? count : null}
                </span>
              ) : null}
            </CalendarDayButton>
          )
        },
      }}
    />
  )
}

export default ReportDiary
