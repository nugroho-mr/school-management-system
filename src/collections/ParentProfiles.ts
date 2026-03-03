import { CollectionConfig, PayloadRequest } from 'payload'
import { isUserParent } from './hooks/parentProfile'

const parentProfileWriteAccess = ({ req }: { req: PayloadRequest }) =>
  Boolean(req.user?.collection === 'admins')

export const ParentProfiles: CollectionConfig = {
  slug: 'parent-profiles',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'user'],
  },
  access: {
    read: (): boolean => true,
    create: parentProfileWriteAccess,
    update: parentProfileWriteAccess,
    delete: parentProfileWriteAccess,
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
