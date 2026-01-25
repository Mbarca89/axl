"use client"

export type LoginRequest = {
    login: string
    password: string
}

export type LoginResponse = {
    message: string
    token: string
    user: {
        userId: string
        username: string
        email: string
        role: "PLAYER" | "ADMIN" | string
    }
}

export type RegisterRequest = {
    username: string
    email: string
    password: string
    firstname: string
    surname: string
    phone?: string
    dni?: string
    birthDate?: string
    position?: string
    side?: string
    number?: number
}

export type RegisterResponse = {
    message: string
    user: {
        userId: string
        username: string
        email: string
        role: "PLAYER" | "ADMIN" | string
    }
}

export type MeResponse = {
    message?: string
    user: {
        userId: string
        username: string
        email: string
        role: "PLAYER" | "ADMIN" | string
        firstname: string
        surname: string
        createdAt?: string
        updatedAt?: string
        avatarUrl?: string | null
        birthDate?: string | null
        number?: string | null
        side?: string | null
        phone?: string | null
        position?: string | null
        dni?: string | null
        playerCode: string
    }
}

export type InviteDto = {
    inviteId: string
    teamId: string
    inviteRole: "PLAYER" | "STAFF" | string
    status: "PENDING" | "ACCEPTED" | "DECLINED" | string
    createdAt: string
    createdByUserId: string
}

export type InvitationsResponse = {
    message: string
    invites: InviteDto[]
}

export type Team = {
    teamId: string
    teamName: string
    country: string
    province: string
    ownerUserId: string
    accessRole: "OWNER" | "MEMBER" | string
    teamRole: string
    joinedAt: string
    logoUrl: string
}

export type TeamsResponse = {
    message: string
    ownedTeams: Team[]
    memberTeams: Team[]
}

export type CreateTeamRequest = {
    teamName: string
    country: string
    province: string
}

export type CreateTeamResponse = {
    message: string
    teamId?: string
}

export type TeamDetail = {
    teamId: string
    teamName: string
    country: string
    province: string
    ownerUserId: string
    logoUrl: string | null
}

export type TeamMember = {
    userId: string
    accessRole: "OWNER" | "MEMBER" | string
    teamRole: "PLAYER" | "STAFF" | string
    username: string
    firstname: string
    surname: string
    avatarUrl: string | null
    joinedAt: string
}

export type TeamDetailResponse = {
    message: string
    team: TeamDetail
    players: TeamMember[]
    staff: TeamMember[]
}

export type InviteByCodeResponse = {
    message: string
    inviteId?: string
}

export type InviteRole = "PLAYER" | "STAFF"

export type InviteByCodeRequest = {
    teamId: string
    playerCode: string
    inviteRole: InviteRole
}

type BasicOkResponse = { message?: string }

async function readJsonSafe(res: Response) {
    const text = await res.text().catch(() => "")
    try {
        return text ? JSON.parse(text) : null
    } catch {
        return null
    }
}

export type UpdateMeRequest = {
    firstname?: string
    surname?: string
    email?: string
    phone?: string | null
    dni?: string | null
    birthDate?: string | null // "YYYY-MM-DD"
    position?: "Front" | "Mid" | "Back" | null
    side?: "Snake" | "Doros" | "Centro" | "Completo" | null
    number?: number | null
}

export type UpdateMeResponse = {
    message: string
    user?: any
}

type PresignAvatarRequest = { contentType: string }
type PresignAvatarResponse = {
    message?: string
    uploadUrl: string
}

type PresignTeamLogoRequest = { teamId: string; contentType: string }
type PresignTeamLogoResponse = {
    message?: string
    uploadUrl: string
}

function extractErrorMessage(payload: any, fallback: string) {
    return payload?.message || payload?.error || fallback
}

export async function axlLogin(req: LoginRequest): Promise<LoginResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_LOGIN_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_LOGIN_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            login: req.login,
            password: req.password,
        }),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Login error ${res.status}`)
    return json as LoginResponse
}


export async function axlRegister(req: RegisterRequest): Promise<RegisterResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_REGISTER_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_REGISTER_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Register error ${res.status}`)
    return json as RegisterResponse
}

export async function axlMe(token: string): Promise<MeResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_ME_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_ME_URL")

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Me error ${res.status}`)
    return json as MeResponse
}

export async function axlGetTeams(token: string): Promise<TeamsResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_TEAMS_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_TEAMS_URL")

    const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Teams error ${res.status}`)

    return json as TeamsResponse
}

export async function axlGetInvitations(token: string): Promise<InvitationsResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_INVITATIONS_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_INVITATIONS_URL")

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Invitations error ${res.status}`)
    return json as InvitationsResponse
}

export async function axlCreateTeam(
    token: string,
    req: CreateTeamRequest
): Promise<CreateTeamResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_CREATE_TEAM_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_CREATE_TEAM_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(req),
    })

    const json = await readJsonSafe(res)

    if (!res.ok) {
        throw new Error(json?.message ?? `Create team error ${res.status}`)
    }

    return json as CreateTeamResponse
}

export async function axlGetTeamDetail(token: string, teamId: string): Promise<TeamDetailResponse> {
    const base = process.env.NEXT_PUBLIC_AXL_TEAM_DETAIL_URL
    if (!base) throw new Error("Falta NEXT_PUBLIC_AXL_TEAM_DETAIL_URL")

    const url = `${base}${base.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(teamId)}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Team detail error ${res.status}`)

    return json as TeamDetailResponse
}

export async function axlInviteByPlayerCode(
    token: string,
    req: InviteByCodeRequest
): Promise<InviteByCodeResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_INVITE_BY_CODE_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_INVITE_BY_CODE_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            teamId: req.teamId,
            playerCode: req.playerCode,
            inviteRole: req.inviteRole,
        }),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(json?.message ?? `Invite error ${res.status}`)

    return json as InviteByCodeResponse
}

export async function axlAcceptInvite(token: string, teamId: string, inviteId: string): Promise<BasicOkResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_ACCEPT_INVITE_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_ACCEPT_INVITE_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId }),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(extractErrorMessage(json, `Accept error ${res.status}`))
    return json as BasicOkResponse
}

export async function axlDeclineInvite(token: string, teamId: string, inviteId: string): Promise<BasicOkResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_DECLINE_INVITE_URL
    if (!url) throw new Error("NEXT_PUBLIC_AXL_DECLINE_INVITE_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId }),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(extractErrorMessage(json, `Decline error ${res.status}`))
    return json as BasicOkResponse
}

export async function axlUpdateMe(token: string, body: UpdateMeRequest): Promise<UpdateMeResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_UPDATE_ME_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_UPDATE_ME_URL")

    const res = await fetch(url, {
        method: "PUT", // si tu lambda usa POST, cambiá acá
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(extractErrorMessage(json, `Update error ${res.status}`))
    return json as UpdateMeResponse
}

export async function axlPresignAvatar(token: string, contentType: string): Promise<PresignAvatarResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_PRESIGN_AVATAR_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_PRESIGN_AVATAR_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType } satisfies PresignAvatarRequest),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(extractErrorMessage(json, `Presign error ${res.status}`))
    return json as PresignAvatarResponse
}

export async function uploadToPresignedUrl(uploadUrl: string, file: Blob, contentType: string) {
    const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Type": contentType,
        },
        body: file,
    })

    if (!res.ok) {
        throw new Error(`Upload error ${res.status}`)
    }
}

export async function axlPresignTeamLogo(token: string, teamId: string, contentType: string): Promise<PresignTeamLogoResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_PRESIGN_TEAM_LOGO_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_PRESIGN_TEAM_LOGO_URL")

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, contentType } satisfies PresignTeamLogoRequest),
    })

    const json = await readJsonSafe(res)
    if (!res.ok) throw new Error(extractErrorMessage(json, `Presign error ${res.status}`))
    return json as PresignTeamLogoResponse
}