import { ValidationError, type CollectionConfig } from 'payload'

const isValidUsernameSchema = (usr: string) => {
  const regex = /^[a-zA-Z0-9_-]*$/
  return regex.test(usr)
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'username',
  },
  auth: {
    // token expiry
    tokenExpiration: 60 * 60 * 24 * 3,
    // login lock
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 10,
    // username & email login support
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: true,
    },
  },
  fields: [
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'relationship',
      relationTo: 'roles',
      required: true,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!isValidUsernameSchema(data?.username)) {
          throw new ValidationError({
            errors: [
              {
                message: 'Only letter, number, dash and underscore are allowed.',
                path: 'username',
              },
            ],
          })
        }
        return data
      },
    ],
  },
}
