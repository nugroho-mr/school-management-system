'use server'

import { unstable_cache as cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

export const getFaq = cache(
  async () => {
    const faqs = await payload.find({
      collection: 'faq',
      fallbackLocale: false,
      limit: 100,
      pagination: false,
      sort: 'sort',
    })

    return faqs.docs
  },
  ['faq:list'],
  { revalidate: 5, tags: ['faq'] },
)
