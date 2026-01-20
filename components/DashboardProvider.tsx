"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { axlMe, axlGetTeams, axlGetInvitations, type Team, type MeResponse, type InviteDto } from "@/lib/axl-api"

type DashboardState = {
  loading: boolean
  error: string | null
  me: MeResponse | null
  ownedTeams: Team[]
  memberTeams: Team[]
  invites: InviteDto[]
  refresh: () => Promise<void>
  logout: () => void
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [me, setMe] = useState<MeResponse | null>(null)
  const [ownedTeams, setOwnedTeams] = useState<Team[]>([])
  const [memberTeams, setMemberTeams] = useState<Team[]>([])
  const [invites, setInvites] = useState<InviteDto[]>([])

  const logout = () => {
    localStorage.removeItem("axl_token")
    router.replace("/login")
  }

  const refresh = async () => {
    const token = localStorage.getItem("axl_token")
    if (!token) {
      router.replace("/login")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [meRes, teamsRes, invRes] = await Promise.all([
        axlMe(token),
        axlGetTeams(token),
        axlGetInvitations(token),
      ])

      setMe(meRes as MeResponse)
      setOwnedTeams(teamsRes.ownedTeams ?? [])
      setMemberTeams(teamsRes.memberTeams ?? [])
      setInvites(invRes.invites ?? [])
    } catch (e: any) {
      setError(e?.message ?? "Error cargando dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ loading, error, me, ownedTeams, memberTeams, invites, refresh, logout }),
    [loading, error, me, ownedTeams, memberTeams, invites]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard debe usarse dentro de <DashboardProvider>")
  return ctx
}
