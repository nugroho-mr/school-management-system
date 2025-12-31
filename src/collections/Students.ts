import { type CollectionConfig } from 'payload'

const isValidUsernameSchema = (usr: string) => {
  const regex = /^[a-zA-Z0-9_-]*$/
  return regex.test(usr)
}

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
  ],
}
