"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Users, Crown, UserPlus, CalendarDays, Camera } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReactCountryFlag from "react-country-flag"

import {
    axlGetTeamDetail,
    axlInviteByPlayerCode,
    type TeamDetailResponse,
    type TeamMember,
} from "@/lib/axl-api"
import { useDashboard } from "@/components/DashboardProvider"

function initials(name: string) {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "??"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
}

const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase()
}

function formatDateShort(dateString: string) {
    return new Date(dateString).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function MemberRow({ m }: { m: TeamMember }) {
    const fullName = `${m.firstname ?? ""} ${m.surname ?? ""}`.trim()
    const isOwner = m.accessRole === "OWNER"

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={m.avatarUrl || undefined} alt={fullName || m.username} />
                    <AvatarFallback className="text-xs">{getInitials(m.firstname, m.surname)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium truncate">{fullName || m.username}</p>
                        {isOwner ? (
                            <Badge className="gap-1">
                                <Crown className="h-3 w-3" />
                                Dueño
                            </Badge>
                        ) : (
                            <Badge variant="secondary">{m.teamRole}</Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">@{m.username}</p>
                </div>
            </div>

            <div className="hidden sm:block text-right text-xs text-muted-foreground">
                <p>Desde</p>
                <p className="font-medium text-foreground">{formatDateShort(m.joinedAt)}</p>
            </div>
        </div>
    )
}

export default function TeamDetailPage() {
    const { me} = useDashboard()

    const router = useRouter()
    const params = useParams<{ teamId: string }>()
    const teamId = params?.teamId

    const [data, setData] = useState<TeamDetailResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inviteRole, setInviteRole] = useState<"PLAYER" | "STAFF">("PLAYER")

    // Invite section
    const [playerCode, setPlayerCode] = useState("")
    const [inviting, setInviting] = useState(false)

    const teamName = data?.team?.teamName ?? ""
    const teamLogo = data?.team?.logoUrl ?? null

    const players = useMemo(() => data?.players ?? [], [data])
    const staff = useMemo(() => data?.staff ?? [], [data])

    useEffect(() => {
        const token = localStorage.getItem("axl_token")
        if (!token) {
            router.replace("/login")
            return
        }
        if (!teamId) return

        setLoading(true)
        setError(null)

        axlGetTeamDetail(token, teamId)
            .then((res) => setData(res))
            .catch((e: any) => setError(e?.message ?? "Error cargando equipo"))
            .finally(() => setLoading(false))
    }, [router, teamId])

    const handleInvite = async () => {
        const token = localStorage.getItem("axl_token")
        if (!token) {
            router.replace("/login")
            return
        }

        const code = playerCode.trim()
        if (!code) {
            toast.error("Ingresá un player code")
            return
        }

        if (code.length < 9) {
            toast.error("Player code inválido")
            return
        }

        const PLAYER_CODE_REGEX = /^\d{5}-\d{4}$/

        if (!PLAYER_CODE_REGEX.test(playerCode.trim())) {
            toast.error("Player code inválido. Formato esperado: 12345-6789")
            return
        }

        setInviting(true)
        try {
            await axlInviteByPlayerCode(token, {
                teamId,
                playerCode: code,
                inviteRole,
            })
            toast.success(`Invitación enviada como ${inviteRole === "PLAYER" ? "Jugador" : "Staff"} ✅`)
            setPlayerCode("")
        } catch (e: any) {
            toast.error(e?.message ?? "No se pudo enviar la invitación")
        } finally {
            setInviting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Image src="/images/logo-800.webp" alt="Cargando..." width={100} height={100} className="animate-pulse" />
                <p className="text-sm text-muted-foreground">
                    <strong>Cargando equipo...</strong>
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-3">
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">{error}</div>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Volver
                </Button>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            {/* Header */}
           {me?.user.userId == data.team.ownerUserId && <div className="flex justify-end">
                <Button
                    className="gap-2"
                    onClick={() => toast.info("Próximamente!")}
                >
                    <CalendarDays className="h-4 w-4" />
                    Inscribirme a una fecha
                </Button>
            </div>}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                        <Avatar className="h-12 w-12">
                            {teamLogo ? (
                                <Image src={teamLogo} alt={teamName} width={48} height={48} className="object-contain" />
                            ) : (
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                    {initials(teamName)}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        {/* overlay edit */}
                        {me?.user.userId == data.team.ownerUserId && <Link
                            href={`/player/equipo/${teamId}/logo`}
                            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition cursor-pointer"
                            aria-label="Cambiar logo"
                            title="Cambiar logo"
                        >
                            <Camera className="h-4 w-4" />
                        </Link>}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{teamName}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <ReactCountryFlag
                                countryCode={data.team.country}
                                svg
                                style={{ width: "1.1em", height: "1.1em" }}
                                title={data.team.country}
                            />
                            <span>{data.team.province}, {data.team.country}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Members */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Jugadores
                        </CardTitle>
                        <CardDescription>{players.length} en el roster</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {players.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Todavía no hay jugadores.</p>
                        ) : (
                            players.map((p) => <MemberRow key={p.userId} m={p} />)
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Staff
                        </CardTitle>
                        <CardDescription>{staff.length} en el staff</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {staff.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay staff cargado.</p>
                        ) : (
                            staff.map((s) => <MemberRow key={s.userId} m={s} />)
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Invite by code */}
            {me?.user.userId == data.team.ownerUserId && <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Invitar jugador
                    </CardTitle>
                    <CardDescription>Buscá por player code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="playerCode">Player code</Label>
                        <Input
                            id="playerCode"
                            placeholder="Ej: 30358-2829"
                            value={playerCode}
                            onChange={(e) => setPlayerCode(e.target.value)}
                            disabled={inviting}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <div className="inline-flex rounded-md border border-input p-1 gap-1">
                                    <Button
                                        type="button"
                                        variant={inviteRole === "PLAYER" ? "default" : "ghost"}
                                        onClick={() => setInviteRole("PLAYER")}
                                        disabled={inviting}
                                    >
                                        Jugador
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={inviteRole === "STAFF" ? "default" : "ghost"}
                                        onClick={() => setInviteRole("STAFF")}
                                        disabled={inviting}
                                    >
                                        Staff
                                    </Button>
                                </div>
                            </div>

                            <Button
                                onClick={handleInvite}
                                disabled={inviting || !playerCode.trim()}
                                className="sm:ml-auto gap-2"
                            >
                                {inviting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Enviar invitación
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>
                </CardContent>
            </Card>}
        </div>
    )
}
