"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { ChevronDown, Loader2, Users, Crown, UserPlus, CalendarDays, Camera, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ReactCountryFlag from "react-country-flag"

import {
    axlGetTeamDetail,
    axlInviteByPlayerCode,
    axlManageTeamMember,
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

function MemberRow({
    m,
    isOwner,
    onSetRole,
    onRemove,
}: {
    m: TeamMember
    isOwner: boolean
    onSetRole?: (memberUserId: string, currentRole: string) => void
    onRemove?: (memberUserId: string) => void
}) {
    const fullName = `${m.firstname ?? ""} ${m.surname ?? ""}`.trim()
    const isOwnerMember = m.accessRole === "OWNER"
    const canManage = isOwner && !isOwnerMember

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={m.avatarUrl || undefined} alt={fullName || m.username} />
                    <AvatarFallback className="text-xs">{getInitials(m.firstname, m.surname)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <Link href={`/jugador/${m.userId}`} className="font-medium truncate hover:text-primary transition">
                            {fullName || m.username}
                        </Link>
                        {isOwnerMember ? (
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

            <div className="flex flex-col gap-2 sm:items-end">
                <div className="text-xs text-muted-foreground text-right">
                    <p>Desde</p>
                    <p className="font-medium text-foreground">{formatDateShort(m.joinedAt)}</p>
                </div>
                {canManage && (
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSetRole?.(m.userId, m.teamRole)}
                        >
                            {m.teamRole === "PLAYER" ? "Hacer staff" : "Hacer jugador"}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onRemove?.(m.userId)}
                        >
                            Eliminar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function TeamDetailPage() {
    const { me } = useDashboard()

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
    const [actionLoading, setActionLoading] = useState(false)

    const teamName = data?.team?.teamName ?? ""
    const teamLogo = data?.team?.logoUrl ?? null

    const players = useMemo(() => data?.players ?? [], [data])
    const staff = useMemo(() => data?.staff ?? [], [data])

    const isTeamOwner = me?.user.userId === data?.team.ownerUserId

    const refreshTeam = async () => {
        const token = localStorage.getItem("axl_token")
        if (!token) {
            router.replace("/login")
            return
        }
        if (!teamId) return

        setLoading(true)
        setError(null)

        try {
            const res = await axlGetTeamDetail(token, teamId)
            setData(res)
        } catch (e: any) {
            setError(e?.message ?? "Error cargando equipo")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshTeam()
    }, [router, teamId])

    const handleSetRole = async (memberUserId: string, currentRole: string) => {
        const token = localStorage.getItem("axl_token")
        if (!token) {
            router.replace("/login")
            return
        }
        setActionLoading(true)
        try {
            const nextRole = currentRole === "PLAYER" ? "STAFF" : "PLAYER"
            await axlManageTeamMember(token, {
                teamId: teamId!,
                memberUserId,
                action: "SET_ROLE",
                teamRole: nextRole,
            })
            toast.success(`Miembro cambiado a ${nextRole}`)
            await refreshTeam()
        } catch (e: any) {
            toast.error(e?.message ?? "No se pudo cambiar el rol")
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveMember = async (memberUserId: string) => {
        const token = localStorage.getItem("axl_token")
        if (!token) {
            router.replace("/login")
            return
        }

        const confirmed = window.confirm("¿Eliminar este miembro del equipo? Esta acción no se puede deshacer.")
        if (!confirmed) return

        setActionLoading(true)
        try {
            await axlManageTeamMember(token, {
                teamId: teamId!,
                memberUserId,
                action: "REMOVE",
            })
            toast.success("Miembro eliminado")
            await refreshTeam()
        } catch (e: any) {
            toast.error(e?.message ?? "No se pudo eliminar el miembro")
        } finally {
            setActionLoading(false)
        }
    }

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
                <Button variant="outline" onClick={() => router.push("/player")}>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="gap-2 cursor-pointer">
                            <CalendarDays className="h-4 w-4" />
                            Inscribirme a una fecha
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/player/fechas/fecha-1/inscribirme">
                                <CalendarDays className="h-4 w-4" />
                                Fecha 1
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/player/fechas/fecha-2/inscribirme">
                                <CalendarDays className="h-4 w-4" />
                                Fecha 2
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                            players.map((p) => (
                                <MemberRow
                                    key={p.userId}
                                    m={p}
                                    isOwner={isTeamOwner}
                                    onSetRole={handleSetRole}
                                    onRemove={handleRemoveMember}
                                />
                            ))
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
                            staff.map((s) => (
                                <MemberRow
                                    key={s.userId}
                                    m={s}
                                    isOwner={isTeamOwner}
                                    onSetRole={handleSetRole}
                                    onRemove={handleRemoveMember}
                                />
                            ))
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
