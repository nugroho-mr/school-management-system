import { headers } from 'next/headers'
import { getPayloadClient } from './payload'

export const getCurrentUser = async () => {
  const payload = await getPayloadClient()
  const h = await headers()
  const { user } = await payload.auth({ headers: h })
  return user ?? null
}
