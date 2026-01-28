import Fecha1Page from "@/components/fecha1"
import type { EventTeamsResponse } from "@/lib/axl-api"

async function getEventTeams(): Promise<EventTeamsResponse> {
    const res = await fetch(
        "https://kyh3y7xllhdj34vtqqweuv3b5i0frwkj.lambda-url.sa-east-1.on.aws?eventId=axl-2026-fecha-1",
        { cache: "no-store" } // o next: { revalidate: 30 } si querés cachear 30s
    )

    if (!res.ok) throw new Error("Error cargando equipos inscriptos")
    return res.json()
}

export default async function EventDetail() {
    const registrations = await getEventTeams()
    return <Fecha1Page registrations={registrations} />
}