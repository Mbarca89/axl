"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Users, Check, X } from "lucide-react"

export interface TeamInvitation {
  inviteId: string
  teamId: string
  teamName?: string | null
  inviteRole: string
  createdAt: string
}


interface TeamInvitationAlertProps {
  invitation: TeamInvitation | null
  onAccept?: (invitationId: string) => void
  onDecline?: (invitationId: string) => void
}

export function TeamInvitationAlert({ invitation, onAccept, onDecline }: TeamInvitationAlertProps) {
  if (!invitation) return null

  const handleAccept = () => {
    // TODO: Connect to your backend
    onAccept?.(invitation.inviteId)

  }

  const handleDecline = () => {
    // TODO: Connect to your backend
    onDecline?.(invitation.inviteId)
  }

  return (
    <Alert className="border-primary bg-primary/5">
      <Users className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">Invitación a equipo</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <span className="text-foreground">
          Has sido invitado a unirte a <strong>{invitation.teamName ?? "un equipo"}</strong>.
        </span>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={handleAccept} className="gap-1">
            <Check className="h-4 w-4" />
            Aceptar
          </Button>
          <Button size="sm" variant="outline" onClick={handleDecline} className="gap-1 bg-transparent">
            <X className="h-4 w-4" />
            Rechazar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
