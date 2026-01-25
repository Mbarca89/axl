"use client"

import { DashboardProvider, useDashboard } from "@/components//DashboardProvider"
import dynamic from "next/dynamic"
const DashboardNavbar = dynamic(
  () => import("@/components/dashboardNavbar").then(m => m.DashboardNavbar),
  { ssr: false }
)

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { me, logout } = useDashboard()

  const userForNavbar = me?.user
    ? {
      firstname: me.user.firstname,
      surname: me.user.surname,
      avatarUrl: me.user.avatarUrl || null,
      username: me.user.username,
    }
    : { firstname: "", surname: "", avatarUrl: null, username: "" }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar user={userForNavbar} onLogout={logout} />
      <main>{children}</main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  )
}
