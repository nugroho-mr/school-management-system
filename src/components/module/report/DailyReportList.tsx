'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaPlus } from 'react-icons/fa6'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { DailyReportSection, groupReportsByDate } from '@/lib/report'
import { DailyReport } from '@/payload-types'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { format } from 'path'
import React, { useState } from 'react'
import { CiViewList } from 'react-icons/ci'
import { FiEdit3 } from 'react-icons/fi'
import Image from 'next/image'

import 'dayjs/locale/id'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { loadMoreWeek } from '@/lib/actions/report'

const DailyReportList = (props: {
  initialDocs: DailyReport[]
  initialOldestMondayISO: string
  initialShowLoadMore: boolean
}) => {
  const [sections, setSections] = useState<DailyReportSection[]>(
    groupReportsByDate(props.initialDocs),
  )
  const [oldestMondayISO, setOldestMondayISO] = useState(props.initialOldestMondayISO)
  const [showLoadMore, setShowLoadMore] = useState(props.initialShowLoadMore)
  const [loading, setLoading] = useState(false)

  const handleLoadMore = async () => {
    setLoading(true)
    try {
      const res = await loadMoreWeek(oldestMondayISO)

      const newSections = groupReportsByDate(res.docs) as unknown as DailyReportSection[]

      // Append to the end (older dates at bottom)
      setSections((prev) => mergeAppendSections(prev, newSections))
      setOldestMondayISO(res.prevWeekMondayISO)
      setShowLoadMore(res.showLoadMore)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {sections.length === 0 ? (
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
        <>
          <div className="flex flex-row-reverse mb-6">
            <div>
              <Link href="/report/new">
                <Button size="sm">
                  <FaPlus /> Laporan Baru
                </Button>
              </Link>
            </div>
          </div>
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
        </>
      )}
      {showLoadMore ? (
        <div className="flex justify-center pt-2">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

const mergeAppendSections = (current: DailyReportSection[], incoming: DailyReportSection[]) => {
  if (incoming.length === 0) return current

  const map = new Map<string, DailyReport[]>()
  for (const s of current) map.set(s.dateKey, s.rows)

  for (const s of incoming) {
    const existing = map.get(s.dateKey)
    if (!existing) {
      map.set(s.dateKey, s.rows)
    } else {
      // append rows (older load more should be distinct; this is just safety)
      const ids = new Set(existing.map((x) => x.id))
      map.set(s.dateKey, [...existing, ...s.rows.filter((x) => !ids.has(x.id))])
    }
  }

  const dates = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : 1))
  return dates.map((dateKey) => ({ dateKey, rows: map.get(dateKey)! }))
}

export default DailyReportList
