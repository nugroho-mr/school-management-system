import type { Payload } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const globalForPayload = globalThis as unknown as {
  payloadClient?: Payload
  payloadPromise?: Promise<Payload>
}

export const getPayloadClient = async (): Promise<Payload> => {
  if (globalForPayload.payloadClient) return globalForPayload.payloadClient
  if (!globalForPayload.payloadPromise) {
    globalForPayload.payloadPromise = getPayload({ config: configPromise })
  }
  const payload = await globalForPayload.payloadPromise
  globalForPayload.payloadClient = payload
  return payload
}
