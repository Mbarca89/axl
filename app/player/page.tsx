"use client"

import { useEffect, useState } from "react"
import { axlMe, type MeResponse } from "@/lib/axl-api"

export default function PlayerDashboardPage() {
    console.log("ME ENV:", process.env.NEXT_PUBLIC_AXL_ME_URL)

    const [me, setMe] = useState<MeResponse["user"] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("axl_token")
        if (!token) return

        axlMe(token)
            .then((r) => setMe(r.user))
            .catch((e) => setError(e?.message ?? "No se pudo cargar /me"))
    }, [])

    if (error) return <div className="p-6">{error}</div>
    if (!me) return <div className="p-6">Cargando...</div>

    console.log("ME ENV:", process.env.NEXT_PUBLIC_AXL_ME_URL)


    return (
        <div className="p-6 space-y-2">
            <h1 className="text-2xl font-semibold">Panel del jugador</h1>
            <div className="text-sm text-muted-foreground">
                {me.name} {me.surname} • @{me.username} • {me.role}
            </div>
        </div>
    )
}
