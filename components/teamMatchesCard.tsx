"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Team, axlGetTeamMatchesByEvent, type TeamMatch, type TeamMatchesByEventResponse } from "@/lib/axl-api"
import { cn } from "@/lib/utils"

interface TeamMatchesCardProps {
  eventId: string
  teams: Team[]
}

type RowStatus = "default" | "draw" | "win" | "loss"

type MatchRow = {
  key: string
  teamName: string
  leftScore: number | null
  rightScore: number | null
  opponentName: string
  status: RowStatus
}

function getRowStatus(teamId: string, match: TeamMatch): RowStatus {
  const hasScores = typeof match.leftScore === "number" && typeof match.rightScore === "number"
  if (!hasScores) return "default"

  if (match.leftScore === match.rightScore) return "draw"

  const isLeftTeam = match.leftTeamId === teamId
  const teamScore = isLeftTeam ? Number(match.leftScore) : Number(match.rightScore)
  const opponentScore = isLeftTeam ? Number(match.rightScore) : Number(match.leftScore)

  return teamScore > opponentScore ? "win" : "loss"
}

function mapMatchToRow(teamId: string, teamName: string, match: TeamMatch): MatchRow {
  const isLeftTeam = match.leftTeamId === teamId

  return {
    key: `${teamId}-${match.matchId}`,
    teamName,
    leftScore: isLeftTeam ? match.leftScore : match.rightScore,
    rightScore: isLeftTeam ? match.rightScore : match.leftScore,
    opponentName: isLeftTeam ? match.rightTeamNameSnapshot : match.leftTeamNameSnapshot,
    status: getRowStatus(teamId, match),
  }
}

const rowClasses: Record<RowStatus, string> = {
  default: "",
  draw: "bg-zinc-900/20",
  win: "bg-emerald-500/10",
  loss: "bg-red-500/10",
}

export function TeamMatchesCard({ eventId, teams }: TeamMatchesCardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TeamMatchesByEventResponse | null>(null)

  const teamIds = useMemo(() => Array.from(new Set(teams.map((team) => team.teamId))), [teams])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (teamIds.length === 0) {
        setData({ eventId, teams: [] })
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await axlGetTeamMatchesByEvent({ eventId, teamIds })
        if (!cancelled) setData(response)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "No se pudieron cargar los partidos")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [eventId, teamIds])

  const rows = useMemo(() => {
    if (!data) return []

    return data.teams.flatMap((team) => team.matches.map((match) => mapMatchToRow(team.teamId, team.teamName, match)))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis partidos</CardTitle>
        <CardDescription>Partidos de los equipos que integras en esta fecha</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <Image src="/images/logo-800.webp" alt="Cargando partidos" width={72} height={72} className="animate-pulse" />
            <p className="text-sm text-muted-foreground">
              <strong>Cargando partidos...</strong>
            </p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">{error}</div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay partidos para tus equipos en esta fecha.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-100 text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className={cn("", rowClasses[row.status])}>
                    <td className="py-2 pr-2 font-medium">{row.teamName}</td>
                    <td className="py-2 px-2 text-center">{row.leftScore ?? "-"}</td>
                    <td className="py-2 px-2 text-center">{row.rightScore ?? "-"}</td>
                    <td className="py-2 pl-2 text-medium">{row.opponentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
