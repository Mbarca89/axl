"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { axlGetPlayerEventHistory, type PlayerEventHistoryItem } from "@/lib/axl-api"
import { calculatePlayerPoints, parseDivisionFromCategory } from "@/lib/player-points"

type PlayerEventHistoryCardProps = {
  userId: string
  birthDate?: string | null
}

type EventHistoryWithPoints = PlayerEventHistoryItem & {
  playerPoints: number
  errorReason?: string
}

function getCurrentSeason() {
  return new Date().getUTCFullYear()
}

function getPlayerCurrentAge(birthDate?: string | null) {
  if (!birthDate) return null

  const [year, month, day] = birthDate.split("-").map(Number)
  if (!year || !month || !day) return null

  const now = new Date()
  let age = now.getUTCFullYear() - year

  const hasBirthdayPassed =
    now.getUTCMonth() + 1 > month || (now.getUTCMonth() + 1 === month && now.getUTCDate() >= day)

  if (!hasBirthdayPassed) {
    age -= 1
  }

  return age >= 0 ? age : null
}

function getEventSeason(event: PlayerEventHistoryItem) {
  const fromId = event.eventId.match(/(19|20)\d{2}/)?.[0]
  if (fromId) return Number(fromId)

  const fromDate = new Date(event.createdAt)
  if (!Number.isNaN(fromDate.getTime())) return fromDate.getUTCFullYear()

  return null
}

function calculateEventPoints(item: PlayerEventHistoryItem, playerCurrentAge: number | null, currentSeason: number) {
  try {
    if (!item.countsForPoints) {
      return { points: 0, errorReason: "No computa para puntaje" }
    }

    if (playerCurrentAge === null) {
      return { points: 0, errorReason: "Falta fecha de nacimiento" }
    }

    const division = parseDivisionFromCategory(item.category)
    if (!division) {
      return { points: 0, errorReason: "División no reconocida" }
    }

    const eventSeason = getEventSeason(item)
    if (eventSeason === null) {
      return { points: 0, errorReason: "Temporada no disponible" }
    }

    const points = calculatePlayerPoints({
      teamEventPoints: item.teamPointsEarned,
      division,
      eventSeason,
      currentSeason,
      playerCurrentAge,
      numberOfTeams: item.totalTeams,
    })

    return { points }
  } catch (error) {
    return {
      points: 0,
      errorReason: error instanceof Error ? error.message : "No se pudo calcular",
    }
  }
}

export function PlayerEventHistoryCard({ userId, birthDate }: PlayerEventHistoryCardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<EventHistoryWithPoints[]>([])

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        setLoading(true)
        setError(null)

        const response = await axlGetPlayerEventHistory(userId)
        if (!active) return

        const currentSeason = getCurrentSeason()
        const playerCurrentAge = getPlayerCurrentAge(birthDate)

        const calculatedHistory = (response.history ?? []).map((item) => {
          const { points, errorReason } = calculateEventPoints(item, playerCurrentAge, currentSeason)
          return {
            ...item,
            playerPoints: points,
            errorReason,
          }
        })

        setHistory(calculatedHistory)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "No se pudo cargar el historial")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [userId, birthDate])

  const totalPoints = useMemo(
    () => Math.round(history.reduce((acc, item) => acc + item.playerPoints, 0) * 100) / 100,
    [history]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial y puntaje</CardTitle>
        <CardDescription>
          Puntaje total: <span className="font-semibold text-foreground">{totalPoints}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Cargando historial...</p>}

        {!loading && error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">{error}</div>
        )}

        {!loading && !error && history.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay eventos registrados para este jugador.</p>
        )}

        {!loading &&
          !error &&
          history.map((item) => (
            <div key={`${item.eventId}-${item.teamId}`} className="rounded-md border p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.eventId}</p>
                <Badge variant={item.countsForPoints ? "default" : "secondary"}>
                  {item.countsForPoints ? "Computa" : "No computa"}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">
                  Equipo: <span className="text-foreground">{item.rosterName}</span>
                </p>
                <p className="text-muted-foreground">
                  Categoría: <span className="text-foreground">{item.category}</span>
                </p>
                <p className="text-muted-foreground">
                  Posición final: <span className="text-foreground">{item.finalRank ?? "-"}</span>
                </p>
                <p className="text-muted-foreground">
                  Puntos equipo: <span className="text-foreground">{item.teamPointsEarned}</span>
                </p>
                <p className="text-muted-foreground">
                  Equipos: <span className="text-foreground">{item.totalTeams}</span>
                </p>
                <p className="text-muted-foreground">
                  Puntaje jugador: <span className="font-semibold text-foreground">{item.playerPoints}</span>
                </p>
              </div>

              {item.errorReason && <p className="text-xs text-amber-600">{item.errorReason}</p>}
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
