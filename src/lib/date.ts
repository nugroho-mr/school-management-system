import { addDays, startOfDay, subDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TZ = 'Asia/Jakarta'

/** "Today" at start-of-day in Asia/Jakarta */
export function jakartaTodayStart(): Date {
  const now = new Date()
  const zoned = toZonedTime(now, TZ)
  return startOfDay(zoned)
}

/** Most recent Monday (including today if today is Monday) */
export function closestPreviousMonday(d: Date): Date {
  // date-fns: Sunday=0, Monday=1 ... Saturday=6
  const day = d.getDay()
  const diffToMonday = (day + 6) % 7 // Monday => 0, Tuesday => 1, ... Sunday => 6
  return subDays(d, diffToMonday)
}

/**
 * Week window that matches your UI:
 * from (monday) to (today) for initial,
 * and for load more: previous Monday..Sunday windows.
 *
 * Returns inclusive start, exclusive end.
 */
export function weekRangeInclusiveStartExclusiveEnd(startInclusive: Date, endInclusive: Date) {
  const start = startOfDay(startInclusive)
  const endExclusive = addDays(startOfDay(endInclusive), 1)
  return { start, endExclusive }
}
