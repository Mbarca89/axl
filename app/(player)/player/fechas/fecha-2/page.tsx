import Fecha1Page, { fecha2Config } from "@/components/fecha1"
import type { EventTeamsResponse } from "@/lib/axl-api"

async function getEventTeams(): Promise<EventTeamsResponse> {
    const res = await fetch(
        "https://kyh3y7xllhdj34vtqqweuv3b5i0frwkj.lambda-url.sa-east-1.on.aws?eventId=axl-2026-fecha-2",
        { cache: "no-store" }
    )

    if (!res.ok) throw new Error("Error cargando equipos inscriptos")
    return res.json()
}

export default async function EventDetail() {
    const registrations = await getEventTeams()
    return <Fecha1Page registrations={registrations} config={fecha2Config} />
}
