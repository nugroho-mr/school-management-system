import { getPayloadClient } from '@/lib/payload'

export const getCurrentStudents = async () => {
  const payload = await getPayloadClient()
  const students = await payload.find({
    collection: 'students',
    limit: 9999,
    // sort: 'fullname',
    // depth: 0,
  })

  return students.docs
}
