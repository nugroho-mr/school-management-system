import { CollectionConfig, PayloadRequest } from 'payload'
import { syncStudentsFamily, validateFamilyCode } from './hooks/family'
import { normalizeUserRole } from '@/lib/user'
import { hasMatchRole } from '@/utils/lib'

const FamilyWriteAccess = ({ req }: { req: PayloadRequest }) =>
  Boolean(req.user?.collection === 'admins')

export const Families: CollectionConfig = {
  slug: 'families',
  access: {
    read: ({ req }: { req: PayloadRequest }) => {
      if (!req.user) return false
      if (req.user.collection === 'admins') return true

      const userRole = normalizeUserRole(req.user.role)
      if (req.user.collection === 'users' && hasMatchRole(userRole, ['super'])) return true

      return {
        parents: {
          contains: req.user.id,
        },
      }
    },
    create: FamilyWriteAccess,
    delete: FamilyWriteAccess,
    update: FamilyWriteAccess,
  },
  fields: [
    {
      name: 'familyCode',
      label: 'Family Code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'A unique code to identify the family', readOnly: true },
    },
    {
      name: 'parents',
      label: 'Parents',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      filterOptions: { 'role.value': { equals: 'parent' } },
    },
    {
      name: 'students',
      label: 'Students',
      type: 'relationship',
      relationTo: 'students',
      hasMany: true,
      required: true,
    },
  ],
  admin: {
    useAsTitle: 'familyCode',
    defaultColumns: ['familyCode', 'parents', 'students'],
  },
  hooks: {
    beforeValidate: [validateFamilyCode],
    afterChange: [syncStudentsFamily],
  },
}
