import { type PayloadRequest, type CollectionConfig } from 'payload'
import { preventMultipleFamily } from './hooks/student'
import { normalizeUserRole } from '@/lib/user'
import { hasMatchRole } from '@/utils/lib'

const studentWriteAccess = ({ req }: { req: PayloadRequest }) => {
  const normalizedRoles = normalizeUserRole(req.user?.role)
  return Boolean(
    hasMatchRole(['super', 'teacher'], normalizedRoles) || req.user?.collection === 'admins',
  )
}

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'fullname',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: studentWriteAccess,
    update: studentWriteAccess,
    delete: studentWriteAccess,
  },
  fields: [
    {
      name: 'fullname',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      label: 'Date of Birth',
      required: true,
    },
    {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      required: true,
      options: [
        { label: 'Laki-laki', value: 'male' },
        { label: 'Perempuan', value: 'female' },
      ],
    },
    {
      name: 'studentID',
      type: 'text',
      label: 'Student ID',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'family',
      type: 'relationship',
      relationTo: 'families',
      required: false,
      index: true,
      admin: { description: 'Link to the family this student belongs to', readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [preventMultipleFamily],
  },
}
