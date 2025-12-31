'use server'

import { unstable_cache as cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Speaker, EventType } from '@/payload-types'

const payload = await getPayload({ config })

type GroupedSpeakers = Record<string, Speaker[]>
export type SpeakersByAlphabet = { eventType?: EventType[]; groupedSpeakers: GroupedSpeakers }

const groupSpeakersByAlphabet = (speakers: Speaker[]) =>
  speakers.reduce((acc: GroupedSpeakers, speaker: Speaker) => {
    const first = speaker.fullName[0].toUpperCase()

    const group =
      first >= 'A' && first <= 'E'
        ? 'A-E'
        : first >= 'F' && first <= 'J'
          ? 'F-J'
          : first >= 'K' && first <= 'O'
            ? 'K-O'
            : first >= 'P' && first <= 'T'
              ? 'P-T'
              : 'U-Z'

    if (!acc[group]) acc[group] = []
    acc[group].push(speaker)
    const sortedSpeakers = Object.keys(acc)
      .sort((a, b) => a.localeCompare(b))
      .reduce(
        (accum, key) => {
          accum[key] = acc[key]
          return accum
        },
        {} as typeof acc,
      )
    return sortedSpeakers
  }, {})

export const getSpeakersByEventType = cache(
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

    let speakers: Speaker[] = []

    if (eventTypeSlug === null) {
      const allSpeakers = await payload.find({
        collection: 'speakers',
        fallbackLocale: false,
        limit: 9999,
        pagination: false,
        depth: 5,
      })
      speakers = allSpeakers.docs.sort((a, b) => {
        return a.fullName.localeCompare(b.fullName)
      })
    } else {
      const sessions = await payload.find({
        collection: 'sessions',
        fallbackLocale: false,
        limit: 9999,
        pagination: false,
        depth: 5,
        ...(eventType && {
          where: {
            'type.slug': { equals: eventTypeSlug },
          },
        }),
      })
      speakers = sessions.docs
        .flatMap((session) => session.speakers ?? [])
        .filter((s): s is Speaker => typeof s !== 'string')
        .sort((a, b) => {
          return a.fullName.localeCompare(b.fullName)
        })
    }

    const groupedSpeakers = groupSpeakersByAlphabet(speakers)

    return {
      ...(eventType && { eventType: eventType.docs }),
      groupedSpeakers,
    } as SpeakersByAlphabet
  },
  ['session:speaker', 'session:eventType', 'session:list', 'speaker:list'],
  { revalidate: 5, tags: ['session', 'speaker'] },
)
