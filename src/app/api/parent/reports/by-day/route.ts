import { getCurrentUser } from '@/lib/auth'
import { jakartaDayRange } from '@/lib/date'
import { getPayloadClient } from '@/lib/payload'
import { Student } from '@/payload-types'
import { NextResponse } from 'next/server'
import { date } from 'zod'

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
  const day = searchParams.get('day')
  const dayRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!day || !dayRegex.test(day)) {
    return NextResponse.json(
      { error: 'Invalid day format. Expected YYYY-MM-DD.' },
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const familyRes = await payload.find({
    collection: 'families',
    where: { parents: { contains: user?.id || '699665d9773460f3335c3e15' } },
    depth: 1,
    limit: 10,
  })

  const families = familyRes?.docs
  const studentIds = families.flatMap((f: any) =>
    (f.students || []).map((s: any) => (typeof s === 'string' ? s : s.id)),
  )

  if (studentIds.length === 0) {
    return NextResponse.json(
      { day, reports: [] },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const { start, end } = jakartaDayRange(day)

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
    depth: 2,
    limit: 2000,
    sort: 'student.fullname',
  })

  const normalizedReports: Record<string, any> = {}

  for (const report of reportRes?.docs || []) {
    const studentId = typeof report.student === 'string' ? report.student : report.student.id
    if (!normalizedReports[studentId]) {
      normalizedReports[studentId] = {
        date: report.date,
        student: report.student,
      }
    }
    normalizedReports[studentId][report.reportType] = {
      note: report.note,
      ...(report.photo && { photo: report.photo }),
    }
  }

  return NextResponse.json(
    { day, reports: normalizedReports },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
