'use client'

import { useTransition, useState } from 'react'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  const [isShowPassword, setIsShowPassword] = useState(false)

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
    <div className="container py-20">
      <Card className="max-w-100 mx-auto shadow-2xl">
        <CardHeader>
          <Image
            src="/images/logo-horizontal.png"
            alt="Logo"
            width={1080}
            height={317}
            className="w-80 mx-auto mb-4"
          />
          <CardTitle className="text-primary text-center">
            Selamat datang di Crescent Wonder
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan username/email dan password Anda untuk masuk.
          </CardDescription>
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
                      <FieldLabel htmlFor="identifier">Username/Email</FieldLabel>
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
                        type={isShowPassword ? 'text' : 'password'}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-password"
                  onChange={() => setIsShowPassword((prev) => !prev)}
                  className="mt-1"
                />
                <label
                  htmlFor="show-password"
                  className="text-sm text-muted-foreground cursor-pointer italic"
                >
                  tampilkan password
                </label>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="login-form" disabled={isPending} className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginPage
