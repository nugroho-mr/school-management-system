import { subDays } from 'date-fns'

/** Most recent Monday (including today if today is Monday) */
export function closestPreviousMonday(d: Date): Date {
  // date-fns: Sunday=0, Monday=1 ... Saturday=6
  const day = d.getDay()
  const diffToMonday = (day + 6) % 7 // Monday => 0, Tuesday => 1, ... Sunday => 6
  return subDays(d, diffToMonday)
}

export const dateStringISO = (date?: string): string => {
  const today = date ? new Date(date) : new Date()
  if (isNaN(today.getTime())) {
    throw new Error(`Invalid date string: ${date}`)
  }
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function jakartaDayRange(day: string) {
  // day: 'YYYY-MM-DD' (interpreted as Jakarta local day)
  const start = `${day}T00:00:00+07:00`

  const [y, m, d] = day.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))

  const ny = next.getUTCFullYear()
  const nm = String(next.getUTCMonth() + 1).padStart(2, '0')
  const nd = String(next.getUTCDate()).padStart(2, '0')

  const end = `${ny}-${nm}-${nd}T00:00:00+07:00`
  return { start, end }
}

export function jakartaMonthRange(month: string) {
  // month: 'YYYY-MM'
  const start = `${month}-01T00:00:00+07:00`

  const [y, m] = month.split('-').map(Number)
  // next month at day 1
  const nextMonth = new Date(Date.UTC(y, m, 1))

  const ny = nextMonth.getUTCFullYear()
  const nm = String(nextMonth.getUTCMonth() + 1).padStart(2, '0')

  const end = `${ny}-${nm}-01T00:00:00+07:00`
  return { start, end }
}

export const toMonthKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
