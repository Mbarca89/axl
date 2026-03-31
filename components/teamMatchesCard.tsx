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
  leftScore: number | null
  rightScore: number | null
  opponentName: string
  status: RowStatus
}

type TeamSection = {
  teamId: string
  teamName: string
  category: string
  rows: MatchRow[]
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

function mapMatchToRow(teamId: string, match: TeamMatch): MatchRow {
  const isLeftTeam = match.leftTeamId === teamId

  return {
    key: `${teamId}-${match.matchId}`,
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

  const sections = useMemo<TeamSection[]>(() => {
    if (!data) return []

    return data.teams.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      category: team.matches[0]?.category ?? "Sin división",
      rows: team.matches.map((match) => mapMatchToRow(team.teamId, match)),
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis partidos</CardTitle>
        <CardDescription>Partidos de los equipos que integras en esta fecha</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <Image src="/images/logo-800.webp" alt="Cargando partidos" width={72} height={72} className="animate-pulse" />
            <p className="text-sm text-muted-foreground">
              <strong>Cargando partidos...</strong>
            </p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">{error}</div>
        ) : sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay partidos para tus equipos en esta fecha.</p>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.teamId} className="rounded-lg border border-border/60">
                <div className="border-b border-border/60 px-4 py-3">
                  <h3 className="text-base font-semibold">{section.teamName}</h3>
                  <p className="text-sm text-muted-foreground">{section.category}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="text-sm">
                    <tbody>
                      {section.rows.map((row) => (
                        <tr key={row.key} className={cn("border-b border-border/40 last:border-0", rowClasses[row.status])}>
                          <td className="py-2 px-4">{section.teamName}</td>
                          <td className="py-2 px-4 text-right font-medium w-[70px]">{row.leftScore ?? "-"}</td>
                          <td className="py-2 px-2 text-center text-muted-foreground w-[32px]">-</td>
                          <td className="py-2 px-2 font-medium w-[70px]">{row.rightScore ?? "-"}</td>
                          <td className="py-2 px-4">{row.opponentName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}