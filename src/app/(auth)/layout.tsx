import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Toaster } from 'sonner'
import LogoutButton from '@/components/layout/LogoutButton'
import '@/app/styles.css'
import './styles.css'

const authLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser()

  // Go to login if no user
  // if (!user) redirect('/auth/login')

  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {user && (
          <header>
            {`Welcome, ${user.name ? user.name : 'username' in user ? user.username : user.email}`}{' '}
            | <LogoutButton />
          </header>
        )}
        <main>{children}</main>
        <Toaster position="top-center" richColors={true} expand={true} />
      </body>
    </html>
  )
}

export default authLayout
