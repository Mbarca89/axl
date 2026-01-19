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
    name: string
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
    message: string
    user: {
        userId: string
        username: string
        email: string
        role: "PLAYER" | "ADMIN" | string
        name: string | null
        surname: string | null
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