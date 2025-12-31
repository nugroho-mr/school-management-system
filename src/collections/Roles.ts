import { ValidationError, type CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: {
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'value',
      label: 'Value',
      type: 'text',
      required: true,
    },
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      required: true,
    },
    {
      name: 'rank',
      label: 'Rank',
      type: 'number',
      required: true,
      min: 0,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (data?.rank !== 0) return data

        const existingRole = await req.payload.find({
          collection: 'roles',
          where: {
            rank: { equals: 0 },
          },
          limit: 1,
        })

        const isSameDoc =
          originalDoc && existingRole.docs.length && existingRole.docs[0].id === originalDoc.id

        if (existingRole.totalDocs > 0 && !isSameDoc) {
          throw new ValidationError({
            errors: [
              {
                message: 'Rank 0 is reserved',
                path: 'rank',
              },
            ],
          })
        }

        return data
      },
    ],
  },
}
