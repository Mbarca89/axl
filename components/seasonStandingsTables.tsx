"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type SeasonPointsItem = {
  eventId: string
  year: string
  teamId: string
  teamName: string
  category: string
  finalRank: number
  totalTeams: number
  points: number
  calculationVersion: string
  closedAt: string
  closedBy: string
}

type SeasonPointsResponse = {
  total: number
  items: SeasonPointsItem[]
}

type TeamByDate = {
  points: number
  finalRank: number
}

type TeamStandingRow = {
  teamId: string
  teamName: string
  total: number
  byDate: Record<string, TeamByDate>
  rankSum: number
}

type CategoryTable = {
  category: string
  dateColumns: string[]
  rows: TeamStandingRow[]
}

const SEASON_POINTS_URL = "https://wulkbukwoidyd6k3igo4dfoqpu0cvmix.lambda-url.sa-east-1.on.aws/"
const CATEGORY_ORDER = ["5v5 D4/D3", "3v3 D5", "3v3 D6"] as const

function getFechaName(eventId: string) {
  const match = eventId.match(/fecha-(\d+)/i)
  if (!match) return eventId
  return `Fecha ${match[1]}`
}

function sortFechaColumns(a: string, b: string) {
  const numA = Number.parseInt(a.replace(/\D/g, ""), 10)
  const numB = Number.parseInt(b.replace(/\D/g, ""), 10)

  if (Number.isNaN(numA) || Number.isNaN(numB)) return a.localeCompare(b)
  return numA - numB
}

function buildCategoryTables(items: SeasonPointsItem[]): CategoryTable[] {
  const byCategory = new Map<string, SeasonPointsItem[]>()

  for (const item of items) {
    const list = byCategory.get(item.category) ?? []
    list.push(item)
    byCategory.set(item.category, list)
  }

  const categories = [...new Set([...CATEGORY_ORDER, ...byCategory.keys()])]

  return categories.map((category) => {
    const records = byCategory.get(category) ?? []
    const datesSet = new Set<string>()
    const teams = new Map<string, TeamStandingRow>()

    for (const record of records) {
      const fechaName = getFechaName(record.eventId)
      datesSet.add(fechaName)

      const current =
        teams.get(record.teamId) ?? {
          teamId: record.teamId,
          teamName: record.teamName,
          total: 0,
          byDate: {},
          rankSum: 0,
        }

      current.total += record.points
      current.rankSum += record.finalRank
      current.byDate[fechaName] = {
        points: record.points,
        finalRank: record.finalRank,
      }

      teams.set(record.teamId, current)
    }

    const dateColumns = Array.from(datesSet).sort(sortFechaColumns)

    const rows = Array.from(teams.values()).sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total
      if (a.rankSum !== b.rankSum) return a.rankSum - b.rankSum
      return a.teamName.localeCompare(b.teamName)
    })

    return {
      category,
      dateColumns,
      rows,
    }
  })
}

export function SeasonStandingsTables() {
  const [data, setData] = useState<SeasonPointsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(SEASON_POINTS_URL, { cache: "no-store" })
        if (!response.ok) {
          throw new Error(`No se pudieron cargar los puntajes de temporada (HTTP ${response.status}).`)
        }

        const json = (await response.json()) as SeasonPointsResponse

        if (!mounted) return
        setData(json)
      } catch {
        if (!mounted) return
        setError("No se pudieron cargar los puntajes de temporada.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const tables = useMemo(() => buildCategoryTables(data?.items ?? []), [data?.items])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando puntajes de temporada...</p>
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <Card key={table.category}>
          <CardHeader>
            <CardTitle className="text-lg">{table.category}</CardTitle>
            <CardDescription>
              Ranking acumulado anual por equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {table.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay puntajes registrados en esta categoría.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Equipo</TableHead>
                      {table.dateColumns.map((dateColumn) => (
                        <TableHead key={dateColumn}>{dateColumn}</TableHead>
                      ))}
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.rows.map((row, index) => (
                      <TableRow key={row.teamId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.teamName}</TableCell>
                        {table.dateColumns.map((dateColumn) => {
                          const score = row.byDate[dateColumn]
                          return (
                            <TableCell key={`${row.teamId}-${dateColumn}`}>
                              {score ? `${score.points} (${score.finalRank}°)` : "-"}
                            </TableCell>
                          )
                        })}
                        <TableCell className="text-right font-semibold">{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
