import ContentHeader from '@/components/layout/ContentHeader'

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty'
import { CiViewList } from 'react-icons/ci'
import { FiEdit3 } from 'react-icons/fi'

import React from 'react'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { DailyReports } from '@/collections/DailyReports'
import { CollectionSlug } from 'payload'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'path'
import { DailyReport } from '@/payload-types'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Ghost } from 'lucide-react'
import DailyReportList from '@/components/module/report/DailyReportList'
import {
  closestPreviousMonday,
  jakartaTodayStart,
  weekRangeInclusiveStartExclusiveEnd,
} from '@/lib/date'
import { fetchDailyReportsInRange, hasReportOlderThan } from '@/lib/actions/report'

const DailyReportPage = async () => {
  const today = jakartaTodayStart()
  const monday = closestPreviousMonday(today)

  const { start, endExclusive } = weekRangeInclusiveStartExclusiveEnd(monday, today)

  const initial = await fetchDailyReportsInRange({
    startISO: start.toISOString(),
    endExclusiveISO: endExclusive.toISOString(),
  })

  const showLoadMore = await hasReportOlderThan(start.toISOString())

  return (
    <>
      <ContentHeader title="Laporan Harian" prevPath="/dashboard" />

      <section>
        <DailyReportList
          initialDocs={initial.docs as unknown as DailyReport[]}
          initialOldestMondayISO={start.toISOString()}
          initialShowLoadMore={showLoadMore}
        />
      </section>
    </>
  )
}

export default DailyReportPage
