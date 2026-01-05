import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import { Toaster } from 'sonner'
import LogoutButton from '@/components/layout/LogoutButton'
import '@/app/styles.css'
import './styles.css'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { Metadata } from 'next'
import { GlobalProcessingOverlay } from '@/components/layout/GlobalOverlay'

export const metadata: Metadata = {
  title: 'Crescent Wonder School Management System',
}

const authLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser()
  const cookieStore = await cookies()
  const defaultSidebarOpen = cookieStore.get('sidebar_state')?.value === 'true'

  // Go to login if no user
  if (!user) redirect('/auth/login')

  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <Toaster position="top-center" richColors={true} expand={true} />
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-white sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b z-30 px-2">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="h-full border-r border-solid border-border"
              />
              <div className="grow"></div>
              {user && (
                <div className="text-sm hidden mr-4 md:block">
                  {`Halo, ${user.name ? user.name : 'username' in user ? user.username : user.email}`}{' '}
                </div>
              )}
            </header>
            <main>
              <div className="px-4 py-6 max-w-270 w-full md:px-10 md:pb-12">
                <div>
                  <GlobalProcessingOverlay />
                </div>
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}

export default authLayout
