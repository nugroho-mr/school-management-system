import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { CiViewList } from 'react-icons/ci'
import { MdOutlineToday } from 'react-icons/md'

import { LuLayoutDashboard } from 'react-icons/lu'

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { getCurrentUser } from '@/lib/auth'
import { normalizeUserRole } from '@/lib/user'
import { hasMatchRole } from '@/utils/lib'

const allReportItems = [
  {
    title: 'Laporan Harian',
    url: '/report',
    icon: CiViewList,
    roles: ['admin', 'superadmin', 'super', 'teacher'],
  },
  {
    title: 'Laporan Harian Siswa',
    url: '/parent/student-diary',
    icon: MdOutlineToday,
    roles: ['parent'],
  },
]

const AppSidebar = async ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const user = await getCurrentUser()
  const userRoles = normalizeUserRole(user?.role) || []

  const reportItems = allReportItems.filter((item) => hasMatchRole(item.roles, userRoles))

  return (
    <Sidebar {...props}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard" className="no-underline">
                    <LuLayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Laporan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="no-underline">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton className="w-full" />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
