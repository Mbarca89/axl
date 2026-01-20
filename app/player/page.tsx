"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { TeamInvitationAlert } from "@/components/team-invitation-alert"
import { PlayerInfoCard } from "@/components/player-info-card"
import { TeamsCard} from "@/components/teams-card"

import { axlMe, axlGetTeams, axlGetInvitations, Team, MeResponse, InviteDto } from "@/lib/axl-api"

export default function DashboardPage() {
  const router = useRouter()

  const [user, setUser] = useState<MeResponse | null>(null)
  const [ownedTeams, setOwnedTeams] = useState<Team[]>([])
  const [memberTeams, setMemberTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<InviteDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const invitationToShow = useMemo(() => {
    // por ahora mostramos la primera pendiente
    return invitations?.[0] ?? null
  }, [invitations])

  useEffect(() => {
    const token = localStorage.getItem("axl_token")
    if (!token) {
      router.replace("/login")
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([axlMe(token), axlGetTeams(token), axlGetInvitations(token)])
      .then(([meRes, teamsRes, invRes]) => {
        setUser(meRes as MeResponse)
        setOwnedTeams(teamsRes.ownedTeams ?? [])
        setMemberTeams(teamsRes.memberTeams ?? [])
        setInvitations(invRes.invites ?? [])
      })
      .catch((e: any) => {
        // si token vencido / 401, mandalo a login
        const msg = e?.message ?? "Error cargando dashboard"
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleAcceptInvitation = async (invitationId: string) => {
    // cuando me pases la lambda de accept lo conectamos
    console.log("Accept invitation:", invitationId)
  }

  const handleDeclineInvitation = async (invitationId: string) => {
    // cuando me pases la lambda de decline lo conectamos
    console.log("Decline invitation:", invitationId)
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando dashboard…</div>
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-3">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </div>
        <button
          className="text-sm underline"
          onClick={() => {
            localStorage.removeItem("axl_token")
            router.push("/login")
          }}
        >
          Volver a iniciar sesión
        </button>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <TeamInvitationAlert
          invitation={invitationToShow}
          onAccept={handleAcceptInvitation}
          onDecline={handleDeclineInvitation}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user.user.username}</h1>
          <p className="text-muted-foreground mt-1">Panel de jugador - Argentinean XBall League</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlayerInfoCard user={user} />
          <TeamsCard ownedTeams={ownedTeams} memberTeams={memberTeams} />
        </div>
      </div>
    </div>
  )
}

