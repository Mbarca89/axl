"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { axlRegisterTeamToEvent, type EventDetailResponse } from "@/lib/axl-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, MapPin, CheckCircle2 } from "lucide-react"
import { useDashboard } from "@/components/DashboardProvider"

export default function RegisterToEventPage({ eventData }: { eventData: EventDetailResponse }) {
  const router = useRouter()
  const { ownedTeams } = useDashboard()

  const [teamId, setTeamId] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ teamName: string; category: string } | null>(null)

  const event = eventData.event

  const teams = useMemo(() => ownedTeams ?? [], [ownedTeams])
  const selectedTeamName = useMemo(
    () => teams.find((t) => t.teamId === teamId)?.teamName ?? "",
    [teams, teamId]
  )

  const canSubmit = eventData.open && !!teamId && !!category && !submitting

  const handleSubmit = async () => {
    const token = localStorage.getItem("axl_token")
    if (!token) {
      router.replace("/login")
      return
    }

    try {
      setSubmitting(true)
      setConfirmed(null)

      await axlRegisterTeamToEvent(token, {
        eventId: event.eventId,
        teamId,
        category,
      })

      setConfirmed({ teamName: selectedTeamName, category })
      toast.success("Inscripción enviada")
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo inscribir")
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = (iso: string) => {
    // viene con offset -03:00, lo mostramos “lindo”
    const dt = new Date(iso)
    return dt.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          <CardDescription>Inscripción de equipos</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Inscripción</div>
                <div className="text-sm font-medium">
                  hasta el  {fmt(event.registrationClosesAt)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Ubicación</div>
                <div className="text-sm font-medium">{event.location}</div>
              </div>
            </div>
          </div>

          {!eventData.open ? (
            <Alert>
              <AlertTitle>Inscripción cerrada</AlertTitle>
              <AlertDescription>
                Este evento no tiene inscripciones abiertas en este momento.
              </AlertDescription>
            </Alert>
          ) : null}

          <Separator />

          {/* Team select */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">Equipo</div>

            <Select value={teamId} onValueChange={setTeamId} disabled={teams.length === 0 || submitting}>
              <SelectTrigger>
                <SelectValue placeholder={teams.length ? "Seleccioná un equipo" : "No tenés equipos propios"} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.teamId} value={t.teamId}>
                    {t.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category select */}
          <div className="space-y-2">
            <div className="text-sm font-semibold">Categoría</div>

            <Select value={category} onValueChange={setCategory} disabled={!eventData.open || submitting}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una categoría" />
              </SelectTrigger>
              <SelectContent>
                {event.categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full cursor-pointer" disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? "Inscribiendo..." : "Inscribirme"}
          </Button>

          {confirmed ? (
            <Alert className="border-primary/40 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Inscripción confirmada</AlertTitle>
              <AlertDescription>
                Equipo <strong>{confirmed.teamName}</strong> inscripto en <strong>{confirmed.category}</strong>.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}