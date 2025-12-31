'use server'

import { login } from '@payloadcms/next/auth'
import { loginSchema } from '@/schemas/auth'
import { cookies } from 'next/headers'
import config from '@payload-config'

export const loginAction = async (input: unknown) => {
  // Validate input data and extract
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Invalid input. Please make sure your input is correct.',
    }
  }
  const { identifier, password } = parsed.data

  // TRY - CATCH to login
  try {
    const { token } = await login({
      collection: 'users',
      config,
      username: identifier,
      password,
    })

    const cookieStore = await cookies()

    cookieStore.set({
      name: 'payload-token',
      value: token || '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      message: 'You have entered the wrong credentials.',
    }
  }
}

export const logoutAction = async () => {
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'payload-token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}
