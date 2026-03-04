import { getPayloadClient } from '@/lib/payload'

export const getCurrentStudents = async () => {
  const payload = await getPayloadClient()
  const students = await payload.find({
    collection: 'students',
    limit: 500,
    sort: 'fullname',
    depth: 0,
    select: {
      fullname: true,
    },
  })

  return students.docs
}
