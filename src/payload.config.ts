import { s3Storage } from '@payloadcms/storage-s3'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Admins } from './collections/Admins'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Students } from './collections/Students'
import { DailyReports } from './collections/DailyReports'
import { ParentProfiles } from './collections/ParentProfiles'
import { Families } from './collections/Families'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET
if (!PAYLOAD_SECRET) throw new Error('PAYLOAD_SECRET environment variable is required')

const DATABASE_URI = process.env.DATABASE_URI
if (!DATABASE_URI) throw new Error('DATABASE_URI environment variable is required')

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      defaultTimezone: 'Asia/Jakarta',
    },
  },
  collections: [Admins, Users, Media, Students, DailyReports, ParentProfiles, Families],
  editor: lexicalEditor(),
  secret: PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: DATABASE_URI,
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: {
          prefix: process.env.S3_PREFIX || 'development',
          disablePayloadAccessControl: true, // Required to bypass the API proxy
          generateFileURL: ({ filename, prefix }) => {
            return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${prefix}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
      },
    }),
  ],
})
