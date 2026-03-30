"use client"

import { useMemo } from "react"
import { TeamInvitationAlert } from "@/components/teamInvitationAlert"
import { PlayerInfoCard } from "@/components/playerInfoCard"
import { TeamsCard } from "@/components/teamsCard"
import { TeamMatchesCard } from "@/components/teamMatchesCard"
import { PageLoading } from "@/components/pageLoading"
import { useDashboard } from "@/components/DashboardProvider"

export default function DashboardPage() {
  const { loading, error, me, ownedTeams, memberTeams, invites, logout } = useDashboard()

  const invitationToShow = useMemo(() => invites?.[0] ?? null, [invites])
  const allTeams = useMemo(() => [...ownedTeams, ...memberTeams], [ownedTeams, memberTeams])

  if (loading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-3">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">{error}</div>
        <button className="text-sm underline" onClick={logout}>
          Volver a iniciar sesión
        </button>
      </div>
    )
  }

  if (!me) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <TeamInvitationAlert invitation={invitationToShow} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {me.user.username}</h1>
          <p className="text-muted-foreground mt-1">Panel de jugador - Argentinean XBall League</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlayerInfoCard user={me} />
          <TeamsCard ownedTeams={ownedTeams} memberTeams={memberTeams} />
        </div>

        <TeamMatchesCard eventId="axl-2026-fecha-1" teams={allTeams} />
      </div>
    </div>
  )
}
