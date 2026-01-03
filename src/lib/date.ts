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
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
