import 'dotenv/config'
import { CollectionSlug, getPayload } from 'payload'
import { Admins } from '@/collections/Admins'
import config from '@payload-config'

async function seedAdmin() {
  const payload = await getPayload({ config })

  const email = process.env.SEED_ADMIN_EMAIL!
  const password = process.env.SEED_ADMIN_PASSWORD!

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set')
  }

  const existing = await payload.find({
    collection: Admins.slug as CollectionSlug,
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    console.log('✅ Admin already exists. Skipping.')
    return
  }

  await payload.create({
    collection: Admins.slug as CollectionSlug,
    data: {
      email,
      password,
      name: 'Super Admin',
      role: 'superadmin',
    },
  })

  console.log('🎉 Admin seeded successfully')
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
