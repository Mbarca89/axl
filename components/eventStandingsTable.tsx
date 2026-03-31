"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { axlGetEventMatches, type EventMatchesResponse, type EventMatch } from "@/lib/axl-api"

export interface TeamStanding {
  teamId: string
  teamName: string
  groupId: string
  category: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  totalPoints: number
  matchResults: string[]
}

export interface GroupStandings {
  category: string
  groupId: string
  teams: TeamStanding[]
}

const POINTS = {
  WIN: 5,
  DRAW: 1,
  LOSS: 0,
}

function normalizeGroupId(groupId: string | null | undefined): string {
  const normalized = groupId?.trim()
  return normalized && normalized.length > 0 ? normalized : "Sin grupo"
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "true" || normalized === "t" || normalized === "1"
  }
  return false
}

function isByeMatch(match: EventMatch): boolean {
  const leftId = String(match.left_team_id ?? "").trim().toUpperCase()
  const rightId = String(match.right_team_id ?? "").trim().toUpperCase()
  const leftName = String(match.left_team_name ?? "").trim().toUpperCase()
  const rightName = String(match.right_team_name ?? "").trim().toUpperCase()

  return leftId === "BYE" || rightId === "BYE" || leftName === "BYE" || rightName === "BYE"
}

function shouldCountMatch(match: EventMatch): boolean {
  if (normalizeBoolean(match.is_finished)) return true
  if (match.finished_at) return true
  if (match.winner_team_id) return true
  if (match.result_type) return true
  return false
}

function ensureTeam(
  table: Map<string, TeamStanding>,
  key: string,
  data: Pick<TeamStanding, "teamId" | "teamName" | "groupId" | "category">
) {
  if (!table.has(key)) {
    table.set(key, {
      ...data,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      totalPoints: 0,
      matchResults: [],
    })
  }

  return table.get(key)!
}

export function buildStandings(
  matches: EventMatch[],
  groupByBlockId: Record<string, string | null | undefined> = {}
): GroupStandings[] {
  const groupMap = new Map<string, Map<string, TeamStanding>>()

  for (const match of matches) {
    if (isByeMatch(match)) continue

    const category = match.category
    const resolvedGroupId = match.group_id ?? groupByBlockId[match.block_id] ?? null
    const groupId = normalizeGroupId(resolvedGroupId)
    const groupKey = `${category}::${groupId}`

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, new Map())
    }

    const teamMap = groupMap.get(groupKey)!
    const left = ensureTeam(teamMap, match.left_team_id, {
      teamId: match.left_team_id,
      teamName: match.left_team_name,
      groupId,
      category,
    })
    const right = ensureTeam(teamMap, match.right_team_id, {
      teamId: match.right_team_id,
      teamName: match.right_team_name,
      groupId,
      category,
    })

    if (!shouldCountMatch(match)) {
      left.matchResults.push("P")
      right.matchResults.push("P")
      continue
    }

    const leftScore = Number(match.left_score ?? 0)
    const rightScore = Number(match.right_score ?? 0)

    left.played += 1
    right.played += 1

    left.goalsFor += leftScore
    left.goalsAgainst += rightScore
    right.goalsFor += rightScore
    right.goalsAgainst += leftScore

    if (leftScore > rightScore) {
      left.won += 1
      right.lost += 1
      left.totalPoints += POINTS.WIN
      right.totalPoints += POINTS.LOSS
      left.matchResults.push(`${leftScore}-${rightScore}`)
      right.matchResults.push(`${rightScore}-${leftScore}`)
    } else if (rightScore > leftScore) {
      right.won += 1
      left.lost += 1
      right.totalPoints += POINTS.WIN
      left.totalPoints += POINTS.LOSS
      right.matchResults.push(`${rightScore}-${leftScore}`)
      left.matchResults.push(`${leftScore}-${rightScore}`)
    } else {
      left.drawn += 1
      right.drawn += 1
      left.totalPoints += POINTS.DRAW
      right.totalPoints += POINTS.DRAW
      left.matchResults.push(`${leftScore}-${rightScore}`)
      right.matchResults.push(`${rightScore}-${leftScore}`)
    }
  }

  const groups: GroupStandings[] = []

  for (const [groupKey, teamMap] of groupMap.entries()) {
    const [category, groupId] = groupKey.split("::")
    const teams = Array.from(teamMap.values())
      .map((team) => ({
        ...team,
        goalDiff: team.goalsFor - team.goalsAgainst,
      }))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
        return a.teamName.localeCompare(b.teamName)
      })

    groups.push({ category, groupId, teams })
  }

  return groups.sort((a, b) => {
    const byCategory = a.category.localeCompare(b.category)
    if (byCategory !== 0) return byCategory
    return a.groupId.localeCompare(b.groupId)
  })
}

export function EventStandingsTable({ eventId }: { eventId: string }) {
  const [data, setData] = useState<EventMatchesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const response = await axlGetEventMatches({ eventId })
        if (!active) return
        setData(response)
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : "No se pudieron cargar los puntajes"
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [eventId])

  const groups = useMemo(
    () => buildStandings(data?.matches ?? [], data?.groupByBlockId ?? {}),
    [data]
  )

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando puntajes...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay partidos para calcular puntajes.</p>
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={`${group.category}-${group.groupId}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{group.category}</CardTitle>
              <CardDescription>Tabla de posiciones en vivo</CardDescription>
            </div>
            <Badge variant="secondary">Grupo {group.groupId}</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Partidos (resultado)</TableHead>
                    <TableHead className="text-right">PJ</TableHead>
                    <TableHead className="text-right">PG</TableHead>
                    <TableHead className="text-right">PE</TableHead>
                    <TableHead className="text-right">PP</TableHead>
                    <TableHead className="text-right">PF</TableHead>
                    <TableHead className="text-right">PC</TableHead>
                    <TableHead className="text-right">DIF</TableHead>
                    <TableHead className="text-right font-semibold">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.teams.map((team, idx) => (
                    <TableRow key={team.teamId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell>{team.matchResults.join(" • ")}</TableCell>
                      <TableCell className="text-right">{team.played}</TableCell>
                      <TableCell className="text-right">{team.won}</TableCell>
                      <TableCell className="text-right">{team.drawn}</TableCell>
                      <TableCell className="text-right">{team.lost}</TableCell>
                      <TableCell className="text-right">{team.goalsFor}</TableCell>
                      <TableCell className="text-right">{team.goalsAgainst}</TableCell>
                      <TableCell className="text-right">{team.goalDiff}</TableCell>
                      <TableCell className="text-right font-semibold">{team.totalPoints}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
