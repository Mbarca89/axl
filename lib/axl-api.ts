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
}

export type TeamsResponse = {
    message: string
    ownedTeams: Team[]
    memberTeams: Team[]
}

async function readJsonSafe(res: Response) {
    const text = await res.text().catch(() => "")
    try {
        return text ? JSON.parse(text) : null
    } catch {
        return null
    }
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