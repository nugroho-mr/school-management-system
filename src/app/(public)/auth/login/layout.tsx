import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

const loginPageLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const user = await getCurrentUser()
  if (user) {
    // If user is already logged in, redirect to dashboard
    redirect('/dashboard')
  }
  return (
    <div className="h-dvh w-dvw flex bg-muted">
      <div className="hidden bg-[url('/images/login-image.png')] bg-cover bg-top-left md:block md:flex-1"></div>
      <div className="bg-[url('/images/login-bg.png')] flex-1 md:max-w-150">{children}</div>
    </div>
  )
}

export default loginPageLayout
