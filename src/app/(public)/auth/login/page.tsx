'use client'

import { useTransition, useState } from 'react'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { loginSchema } from '@/schemas/auth'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/lib/actions/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { IoAlertCircleOutline } from 'react-icons/io5'

const LoginPage = () => {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    setServerError(null)
    startTransition(async () => {
      const res = await loginAction(data)
      // const res = { ok: false, message: 'Invalid credentials' } // Mock response
      if (!res.ok) {
        setServerError(res.message ?? 'Login failed. Please try again.')
        return
      }
      // Handle successful login (e.g., redirect or show success message)
      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <div className="container py-40">
      <Card className="max-w-100 mx-auto">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Masukkan username/email dan password Anda untuk masuk.</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <IoAlertCircleOutline className="h-4 w-4" />
              <AlertTitle>Unable to log in</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <form id="login-form" onSubmit={loginForm.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Controller
                name="identifier"
                control={loginForm.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identifier">Username</FieldLabel>
                      <Input
                        {...field}
                        id="identifier"
                        placeholder="username"
                        autoComplete="username"
                        disabled={isPending}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name="password"
                control={loginForm.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        type="password"
                        {...field}
                        id="password"
                        placeholder="password"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="login-form" disabled={isPending}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginPage
