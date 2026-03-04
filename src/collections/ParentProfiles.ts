import { CollectionConfig, PayloadRequest } from 'payload'
import { isUserParent } from './hooks/parentProfile'
import { normalizeUserRole } from '@/lib/user'
import { hasMatchRole } from '@/utils/lib'

const parentProfileWriteAccess = ({ req }: { req: PayloadRequest }) =>
  Boolean(req.user?.collection === 'admins')

const parentProfileReadAccess = ({ req }: { req: PayloadRequest }) => {
  if (!req.user) {
    return false
  }
  if (req.user.collection === 'admins') {
    return true
  }

  const userRoles = normalizeUserRole(req.user.role)
  if (hasMatchRole(['super'], userRoles)) {
    return true
  }

  if (hasMatchRole(['parent'], userRoles)) {
    return {
      id: {
        equals: req.user.id,
      },
    }
  }

  return false
}

export const ParentProfiles: CollectionConfig = {
  slug: 'parent-profiles',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'user'],
  },
  access: {
    read: parentProfileReadAccess,
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
