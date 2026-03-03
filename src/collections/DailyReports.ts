import { CollectionConfig, CollectionSlug, PayloadRequest } from 'payload'

import {
  deleteOldPhotoOnPublish,
  setCreatedBy,
  validateDateNotInFuture,
  validateUniquePublishedReport,
} from './hooks/dailyReport'
import { hasMatchRole } from '@/utils/lib'
import { normalizeUserRole } from '@/lib/user'

const dailyReportWriteAccess = ({ req }: { req: PayloadRequest }) => {
  const normalizedRoles = normalizeUserRole(req.user?.role)
  return Boolean(
    hasMatchRole(['super', 'teacher'], normalizedRoles) || req.user?.collection === 'admins',
  )
}

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
    create: dailyReportWriteAccess,
    update: dailyReportWriteAccess,
    delete: dailyReportWriteAccess,
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
    beforeChange: [setCreatedBy, validateDateNotInFuture, validateUniquePublishedReport],
    afterChange: [deleteOldPhotoOnPublish],
  },
}
