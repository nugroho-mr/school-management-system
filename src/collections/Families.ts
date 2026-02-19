import { CollectionConfig } from 'payload'
import { syncStudentsFamily, validateFamilyCode } from './hooks/family'

export const Families: CollectionConfig = {
  slug: 'families',
  access: {
    read: (): boolean => true,
    create: ({ req }): boolean => req.user?.role === 'admin' || req.user?.role === 'superadmin',
    delete: ({ req }): boolean => req.user?.role === 'admin' || req.user?.role === 'superadmin',
    update: ({ req }): boolean => req.user?.role === 'admin' || req.user?.role === 'superadmin',
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
