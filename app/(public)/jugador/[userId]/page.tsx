"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CalendarDays, Hash, MapPin, Sparkles, UserRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { axlGetPlayerProfile, type PlayerProfileResponse } from "@/lib/axl-api"
import { PlayerEventHistoryCard } from "@/components/playerEventHistoryCard"

function formatDateShort(dateString?: string | null) {
  if (!dateString) return "No especificada"
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const getInitials = (firstname?: string | null, surname?: string | null) => {
  const f = firstname?.trim() || ""
  const s = surname?.trim() || ""
  if (!f && !s) return "??"
  if (!s) return f.slice(0, 2).toUpperCase()
  if (!f) return s.slice(0, 2).toUpperCase()
  return `${f[0]}${s[0]}`.toUpperCase()
}

function getPositionLabel(position?: string | null) {
  if (!position) return "No especificada"
  const labels: Record<string, string> = {
    Front: "Front",
    Mid: "Mid",
    Back: "Back",
  }
  return labels[position] ?? position
}

function getSideLabel(side?: string | null) {
  if (!side) return "No especificado"
  const labels: Record<string, string> = {
    Snake: "Snake",
    Doros: "Dorito",
    Centro: "Centro",
    Completo: "Completo",
  }
  return labels[side] ?? side
}

export default function PlayerPublicProfilePage() {
  const params = useParams<{ userId?: string }>()
  const userId = params?.userId

  const [data, setData] = useState<PlayerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError("No se pudo resolver el usuario de la ruta")
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axlGetPlayerProfile(userId)
        setData(res)
      } catch (e: any) {
        setError(e?.message ?? "No se pudo cargar el perfil")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Image src="/images/logo-800.webp" alt="Cargando..." width={100} height={100} className="animate-pulse" />
        <p className="text-sm text-muted-foreground">Cargando perfil público...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">{error}</div>
        <Link href="/" className="text-sm text-primary underline">Volver</Link>
      </div>
    )
  }

  if (!data) return null

  const user = data.user
  const fullName = `${user.firstname ?? ""} ${user.surname ?? ""}`.trim()
  const token = typeof window !== "undefined" ? localStorage.getItem("axl_token") : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-background via-background to-primary/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg sm:h-28 sm:w-28">
                    <AvatarImage src={user.avatarUrl || undefined} alt={fullName || user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                      {getInitials(user.firstname, user.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 rounded-full border border-background bg-background p-2 shadow-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-2xl leading-tight">{fullName || user.username}</CardTitle>
                    {user.role && <Badge variant="secondary">{user.role}</Badge>}
                    {user.currentRank && <Badge>{user.currentRank}</Badge>}
                  </div>
                  <CardDescription className="mt-2 text-base">@{user.username}</CardDescription>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Posición</span>
                </div>
                <p className="mt-2 font-semibold">{getPositionLabel(user.position)}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  <span>Lado</span>
                </div>
                <p className="mt-2 font-semibold">{getSideLabel(user.side)}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Fecha de nacimiento</span>
                </div>
                <p className="mt-2 font-semibold">{formatDateShort(user.birthDate)}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Número</span>
                </div>
                <p className="mt-2 font-semibold">{user.number != null ? `#${user.number}` : "No especificado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <PlayerEventHistoryCard currentRank={user.currentRank ?? "Sin categoría"} token={token} birthDate={user.birthDate ?? null} />
      </div>
    </div>
  )
}
