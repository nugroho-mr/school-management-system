'use server'

import { unstable_cache as cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EventType, Session } from '@/payload-types'
import { start } from 'repl'

const payload = await getPayload({ config })

export type GroupedSessionsByDate = Record<string, Session[]>

export const getEventTypes = cache(
  async () => {
    const eventTypes = await payload.find({
      collection: 'eventTypes',
      fallbackLocale: false,
      limit: 9999,
      sort: 'sort',
      pagination: false,
      depth: 5,
    })

    return eventTypes.docs as EventType[]
  },
  ['eventType:list'],
  { revalidate: 5, tags: ['eventType'] },
)

const groupSessionsByDate = (sessions: Session[]) => {
  return sessions.reduce((acc: Record<string, any[]>, session: Session) => {
    const date = session.sessionDate.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push({
      ...session,
      startTime: `${session.sessionDate.split('T')[0]}T${session.startTime.split('T')[1]}`,
      endTime: session.endTime
        ? `${session.sessionDate.split('T')[0]}T${session.endTime.split('T')[1]}`
        : null,
    })
    acc[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
    return acc
  }, {})
}

export const getSessionsByEventType = cache(
  async (eventTypeSlug: string | null = null) => {
    const eventType = eventTypeSlug
      ? await payload.find({
          collection: 'eventTypes',
          where: { slug: { equals: eventTypeSlug } },
          limit: 1,
          pagination: false,
          fallbackLocale: false,
        })
      : false

    const sessions = await payload.find({
      collection: 'sessions',
      fallbackLocale: false,
      limit: 9999,
      pagination: false,
      sort: 'sessionDate',
      depth: 5,
      ...(eventType && {
        where: {
          'type.slug': { equals: eventTypeSlug },
        },
      }),
    })

    const groupedSessions = groupSessionsByDate(sessions.docs)

    return groupedSessions as GroupedSessionsByDate
  },
  ['session:list', 'eventType:list'],
  {
    revalidate: 5,
    tags: ['session', 'eventType'],
  },
)
