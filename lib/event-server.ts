import type { EventTeamsResponse } from "@/lib/axl-api"

export async function getEventTeams(eventId: string): Promise<EventTeamsResponse> {
  const url = new URL(process.env.AXL_GET_EVENT_TEAMS_URL || "https://kyh3y7xllhdj34vtqqweuv3b5i0frwkj.lambda-url.sa-east-1.on.aws")
  url.searchParams.set("eventId", eventId)
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Error cargando equipos inscriptos")
  return res.json()
}
