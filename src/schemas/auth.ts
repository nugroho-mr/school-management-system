import { z } from 'zod'

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .regex(/^[a-zA-Z0-9-_]+$/i, 'Only letter, number, underscore and dash allowed')
export const emailSchema = z.email()
export const passwordSchema = z
  .string()
  .trim()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[a-z]/, 'Must include at least 1 lowercase letter')
  .regex(/[A-Z]/, 'Must include at least 1 uppercase letter')
  .regex(/[0-9]/, 'Must include at least 1 number')

export const loginSchema = z.object({
  identifier: z.union([z.email(), z.string().trim().min(1)]),
  password: z.string().min(1),
})

export type LoginInputType = z.infer<typeof loginSchema>
