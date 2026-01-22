"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Users, Check, X, Loader2 } from "lucide-react"

import { axlAcceptInvite, axlDeclineInvite } from "@/lib/axl-api"
import { useDashboard } from "./DashboardProvider"

export interface TeamInvitation {
  inviteId: string
  teamId: string
  teamName?: string | null
  inviteRole: string
  createdAt: string
}

export function TeamInvitationAlert({ invitation }: { invitation: TeamInvitation | null }) {
  const { refresh, logout } = useDashboard()
  const [loadingAction, setLoadingAction] = useState<"accept" | "decline" | null>(null)

  if (!invitation) return null

  const token = typeof window !== "undefined" ? localStorage.getItem("axl_token") : null

  const onUnauthorized = () => {
    toast.error("Sesión vencida. Volvé a iniciar sesión.")
    logout()
  }

  const handleAccept = async () => {
    if (!token) return onUnauthorized()

    setLoadingAction("accept")
    try {
      await axlAcceptInvite(token, invitation.teamId, invitation.inviteId)
      toast.success("Invitación aceptada")
      await refresh() // actualiza equipos + invitaciones
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo aceptar la invitación")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDecline = async () => {
    if (!token) return onUnauthorized()

    setLoadingAction("decline")
    try {
      await axlDeclineInvite(token, invitation.teamId, invitation.inviteId)
      toast.success("Invitación rechazada")
      await refresh()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo rechazar la invitación")
    } finally {
      setLoadingAction(null)
    }
  }

  const busy = loadingAction !== null

  return (
    <Alert className="border-primary bg-primary/5">
      <Users className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">Invitación a equipo</AlertTitle>

      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span className="text-foreground">
          Has sido invitado a unirte a <strong>{invitation.teamName ?? "un equipo"}</strong>.
        </span>

        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={handleAccept} className="gap-1" disabled={busy}>
            {loadingAction === "accept" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Aceptando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Aceptar
              </>
            )}
          </Button>

          <Button size="sm" variant="outline" onClick={handleDecline} className="gap-1 bg-transparent" disabled={busy}>
            {loadingAction === "decline" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rechazando...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Rechazar
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
