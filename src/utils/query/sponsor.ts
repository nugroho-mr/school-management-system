'use server'

import { unstable_cache as cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

export const getSponsorGroup = cache(
  async () => {
    const sponsorGroups = await payload.find({
      collection: 'sponsorGroups',
      fallbackLocale: false,
      limit: 100,
      sort: 'sort',
      pagination: false,
      depth: 5,
    })

    return sponsorGroups.docs
  },
  ['sponsor:list'],
  { revalidate: 5, tags: ['sponsor'] },
)
