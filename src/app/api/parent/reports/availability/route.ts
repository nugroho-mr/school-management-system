import { getCurrentUser } from '@/lib/auth'
import { dateStringISO, jakartaMonthRange } from '@/lib/date'
import { getPayloadClient } from '@/lib/payload'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const user = await getCurrentUser()

  // if (!user) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized' },
  //     {
  //       status: 401,
  //       headers: { 'Content-Type': 'application/json' },
  //     },
  //   )
  // }
  // if (typeof user.role === 'string' ? user.role !== 'parent' : user.role?.value !== 'parent') {
  //   return NextResponse.json(
  //     { error: 'Forbidden' },
  //     {
  //       status: 403,
  //       headers: { 'Content-Type': 'application/json' },
  //     },
  //   )
  // }

  const searchParams = new URL(req.url).searchParams
  const month = searchParams.get('month')
  const monthRegex = /^\d{4}-\d{2}$/
  if (!month || !monthRegex.test(month)) {
    return NextResponse.json(
      { error: 'Invalid month format. Expected YYYY-MM.' },
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const familyRes = await payload.find({
    collection: 'families',
    where: { parents: { contains: user?.id || '699665d9773460f3335c3e15' } },
    depth: 2,
    limit: 10,
  })

  const families = familyRes?.docs
  const studentIds = families.flatMap((f: any) =>
    (f.students || []).map((s: any) => (typeof s === 'string' ? s : s.id)),
  )

  if (studentIds.length === 0) {
    return NextResponse.json(
      { month, days: {} },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const { start, end } = jakartaMonthRange(month)

  const reportRes = await payload.find({
    collection: 'daily-reports',
    where: {
      and: [
        { student: { in: studentIds } },
        {
          date: {
            greater_than_equal: start,
          },
        },
        {
          date: {
            less_than_equal: end,
          },
        },
      ],
    },
    depth: 0,
    limit: 2000,
    sort: 'date',
  })

  const days: Record<string, { count: number }> = {}

  for (const report of reportRes?.docs || []) {
    const key = dateStringISO(report.date)
    if (!days[key]) {
      days[key] = { count: 0 }
    }
    days[key].count += 1
  }

  return NextResponse.json(
    { month, days },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
