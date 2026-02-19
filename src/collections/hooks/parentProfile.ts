import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

export const isUserParent: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data?.user) {
    throw new ValidationError({ errors: [{ message: 'User is required', path: 'user' }] })
  }
  const userId = typeof data.user === 'string' ? data.user : data.user.id

  const user = await req.payload.findByID({
    collection: 'users',
    id: userId,
    depth: 1,
  })

  const userIsParent =
    typeof user?.role === 'string' ? user.role === 'parent' : user?.role?.value === 'parent'

  if (!userIsParent) {
    throw new ValidationError({
      errors: [
        {
          message: 'The linked user must have the role of parent.',
          path: 'user',
        },
      ],
    })
  }

  return data
}
