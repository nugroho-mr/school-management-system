import { Collection, CollectionBeforeValidateHook, ValidationError } from 'payload'

type Rel = string | { id: string } | null | undefined
const getId = (v: Rel) => (typeof v === 'string' ? v : v?.id)

export const preventMultipleFamily: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const nextFamilyId = getId(data?.family)
  if (!nextFamilyId) {
    return data
  }
  const currentFamilyId = getId(originalDoc?.family)
  if (!currentFamilyId) {
    return data
  }
  if (nextFamilyId === currentFamilyId) {
    return data
  }

  throw new ValidationError({
    collection: 'students',
    errors: [
      {
        message: 'Student is already linked to a family. Multiple family links are not allowed.',
        path: 'family',
      },
    ],
  })
}
