"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { axlGetEventMatches, type EventMatchesResponse, type EventMatch } from "@/lib/axl-api"

type MatchResult = {
  summary: string
  detail: string
}

export interface TeamStanding {
  teamId: string
  teamName: string
  groupId: string
  stage: string
  category: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  totalPoints: number
  matchResults: MatchResult[]
}

export interface GroupStandings {
  stage: string
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

function normalizeStage(stage: string | null | undefined): string {
  const normalized = stage?.trim()
  return normalized && normalized.length > 0 ? normalized : "Sin fase"
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
  data: Pick<TeamStanding, "teamId" | "teamName" | "groupId" | "category" | "stage">
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
    const stage = normalizeStage(match.stage)
    const resolvedGroupId = match.group_id ?? groupByBlockId[match.block_id] ?? null
    const groupId = normalizeGroupId(resolvedGroupId)
    const groupKey = `${stage}::${category}::${groupId}`
    const detail = `${match.left_team_name} ${match.left_score ?? "-"} - ${match.right_score ?? "-"} ${match.right_team_name}`

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, new Map())
    }

    const teamMap = groupMap.get(groupKey)!
    const left = ensureTeam(teamMap, match.left_team_id, {
      teamId: match.left_team_id,
      teamName: match.left_team_name,
      groupId,
      category,
      stage,
    })
    const right = ensureTeam(teamMap, match.right_team_id, {
      teamId: match.right_team_id,
      teamName: match.right_team_name,
      groupId,
      category,
      stage,
    })

    if (!shouldCountMatch(match)) {
      left.matchResults.push({ summary: "P", detail })
      right.matchResults.push({ summary: "P", detail })
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
      left.matchResults.push({ summary: `${leftScore}-${rightScore}`, detail })
      right.matchResults.push({ summary: `${rightScore}-${leftScore}`, detail })
    } else if (rightScore > leftScore) {
      right.won += 1
      left.lost += 1
      right.totalPoints += POINTS.WIN
      left.totalPoints += POINTS.LOSS
      right.matchResults.push({ summary: `${rightScore}-${leftScore}`, detail })
      left.matchResults.push({ summary: `${leftScore}-${rightScore}`, detail })
    } else {
      left.drawn += 1
      right.drawn += 1
      left.totalPoints += POINTS.DRAW
      right.totalPoints += POINTS.DRAW
      left.matchResults.push({ summary: `${leftScore}-${rightScore}`, detail })
      right.matchResults.push({ summary: `${rightScore}-${leftScore}`, detail })
    }
  }

  const groups: GroupStandings[] = []

  for (const [groupKey, teamMap] of groupMap.entries()) {
    const [stage, category, groupId] = groupKey.split("::")
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

    groups.push({ stage, category, groupId, teams })
  }

  return groups.sort((a, b) => {
    const byStage = a.stage.localeCompare(b.stage)
    if (byStage !== 0) return byStage
    const byCategory = a.category.localeCompare(b.category)
    if (byCategory !== 0) return byCategory
    return a.groupId.localeCompare(b.groupId)
  })
}

function MatchResultCell({ result }: { result: MatchResult }) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="hidden cursor-help border-b border-dotted border-muted-foreground/60 md:inline">{result.summary}</span>
        </TooltipTrigger>
        <TooltipContent side="top">{result.detail}</TooltipContent>
      </Tooltip>

      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="inline cursor-pointer border-b border-dotted border-muted-foreground/60 md:hidden">
            {result.summary}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-xs p-2 text-xs">{result.detail}</PopoverContent>
      </Popover>
    </>
  )
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
  const groupsByStage = useMemo(
    () =>
      groups.reduce<Record<string, GroupStandings[]>>((acc, group) => {
        if (!acc[group.stage]) acc[group.stage] = []
        acc[group.stage].push(group)
        return acc
      }, {}),
    [groups]
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
      {Object.entries(groupsByStage).map(([stage, stageGroups]) => (
        <section key={stage} className="space-y-3">
          <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide">Fase: {stage}</h3>
          </div>
          {stageGroups.map((group) => (
            <Card key={`${group.stage}-${group.category}-${group.groupId}`}>
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
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              {team.matchResults.map((result, index) => (
                                <span key={`${team.teamId}-${group.groupId}-result-${index}`} className="inline-flex items-center gap-2">
                                  {index > 0 && <span className="text-muted-foreground">•</span>}
                                  <MatchResultCell result={result} />
                                </span>
                              ))}
                            </div>
                          </TableCell>
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
        </section>
      ))}
    </div>
  )
}
