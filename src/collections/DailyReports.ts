import { CollectionConfig, CollectionSlug } from 'payload'

export const DailyReports: CollectionConfig = {
  slug: 'daily-reports',
  labels: {
    singular: 'Daily Report',
    plural: 'Daily Reports',
  },
  admin: {
    defaultColumns: ['date', 'reportType', 'student', 'createdBy'],
    useAsTitle: 'date',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) =>
      Boolean(
        req.user?.role === 'admin' ||
          req.user?.role === 'teacher' ||
          req.user?.collection === 'admins',
      ),
    update: ({ req }) =>
      Boolean(
        req.user?.role === 'admin' ||
          req.user?.role === 'teacher' ||
          req.user?.collection === 'admins',
      ),
    delete: ({ req }) =>
      Boolean(
        req.user?.role === 'admin' ||
          req.user?.role === 'teacher' ||
          req.user?.collection === 'admins',
      ),
  },
  versions: {
    drafts: true,
    maxPerDoc: 3,
  },
  fields: [
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
    },
    {
      name: 'reportType',
      label: 'Report Type',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Montessori', value: 'montessori' },
      ],
      required: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      hasMany: false,
      required: true,
    },
    {
      name: 'note',
      label: 'Note',
      type: 'textarea',
      required: true,
    },
    {
      name: 'photo',
      label: 'Photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'createdBy',
      label: 'Created By',
      type: 'relationship',
      relationTo: ['admins', 'users'],
      required: true,
      hasMany: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!req.user) throw new Error('Anda tidak memiliki otorisasi')
        data.createdBy = {
          relationTo: req.user.collection,
          value: req.user.id,
        }

        // if (data._status === 'published') {
        const hasExistingReport = await req.payload.find({
          collection: DailyReports.slug as CollectionSlug,
          where: {
            student: { equals: data.student },
            date: { equals: data.date },
            reportType: { equals: data.reportType },
            _status: { equals: 'published' },
          },
          limit: 1,
          draft: true,
        })

        if (hasExistingReport.totalDocs > 0) {
          throw new Error(
            `Laporan ${data.reportType} untuk siswa ini pada tanggal tersebut sudah ada`,
          )
        }
        // }

        if (data?.date) {
          const dateSubmitted = new Date(data.date)
          const today = new Date()
          today.setHours(23, 59, 59, 999)
          if (dateSubmitted.getTime() > today.getTime()) {
            throw new Error('Tanggal laporan tidak boleh lebih dari hari ini')
          }
        }
        return data
      },
    ],
  },
}
