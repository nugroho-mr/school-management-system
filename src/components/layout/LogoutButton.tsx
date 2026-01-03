'use client'

import { logoutAction } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MdLogout } from 'react-icons/md'

const LogoutButton = (props: { className?: string }) => {
  const handleLogout = async () => {
    logoutAction()
    redirect('/auth/login')
  }

  return (
    <Button onClick={handleLogout} {...props}>
      <MdLogout className="transform rotate-180" /> Logout
    </Button>
  )
}

export default LogoutButton
