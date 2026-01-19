"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("axl_token")
    if (!token) router.replace("/login")
  }, [router])

  return <>{children}</>
}
