import { DailyReport } from '@/payload-types'
import { format } from 'date-fns'

export type DailyReportSection = {
  dateKey: string
  rows: DailyReport[]
}

export const groupReportsByDate = <T extends { date: string }>(rows: T[]) => {
  const map = new Map<string, T[]>()

  for (const r of rows) {
    const key = format(new Date(r.date), 'yyyy-MM-dd')
    const arr = map.get(key) ?? []
    arr.push(r)
    map.set(key, arr)
  }

  // Keep dates in newest -> oldest
  const dates = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : 1))

  return dates.map((dateKey) => ({
    dateKey,
    rows: map.get(dateKey)!,
  }))
}
