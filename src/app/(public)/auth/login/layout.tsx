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
  return <>{children}</>
}

export default loginPageLayout
