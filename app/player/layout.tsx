"use client"

import React from "react"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { useRouter } from "next/navigation"

// Mock user data - Replace with actual user data from your backend
const mockUser = {
  name: "Mauricio",
  surname: "Barca",
  avatarUrl: null,
  username: "mauricio",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = () => {
    // TODO: Connect to your backend logout
    // Clear tokens, session, etc.
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar user={mockUser} onLogout={handleLogout} />
      <main>{children}</main>
    </div>
  )
}
