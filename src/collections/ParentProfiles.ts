import { CollectionConfig } from 'payload'
import { isUserParent } from './hooks/parentProfile'

export const ParentProfiles: CollectionConfig = {
  slug: 'parent-profiles',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'user'],
  },
  access: {
    read: (): boolean => true,

    create: ({ req }): boolean =>
      Boolean(req.user?.role === 'admin' || req.user?.collection === 'admins'),
    update: ({ req }): boolean =>
      Boolean(req.user?.role === 'admin' || req.user?.collection === 'admins'),
    delete: ({ req }): boolean =>
      Boolean(req.user?.role === 'admin' || req.user?.collection === 'admins'),
  },
  fields: [
    {
      name: 'user',
      label: 'User',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Link to the user account for this parent' },
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      index: true,
    },
  ],
  hooks: {
    beforeValidate: [isUserParent],
  },
}
