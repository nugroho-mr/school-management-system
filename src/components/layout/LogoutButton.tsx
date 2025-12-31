'use client'

import { logoutAction } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

const LogoutButton = () => {
  const handleLogout = async () => {
    logoutAction()
    redirect('/auth/login')
  }

  return <Button onClick={handleLogout}>Logout</Button>
}

export default LogoutButton
