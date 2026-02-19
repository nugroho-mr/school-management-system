import { type CollectionConfig } from 'payload'
import { preventMultipleFamily } from './hooks/student'

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'fullname',
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
  fields: [
    {
      name: 'fullname',
      type: 'text',
      label: 'Full Name',
      required: true,
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
