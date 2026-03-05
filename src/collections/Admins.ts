import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 1, // 1 day
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 10, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        {
          value: 'admin',
          label: 'Admin',
        },
        {
          value: 'superadmin',
          label: 'Super Admin',
        },
      ],
    },
  ],
}
