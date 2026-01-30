import RegisterToEventPage from "@/components/registerToEvent"
import { EventDetailResponse } from "@/lib/axl-api"

async function axlGetEvent(eventId: string): Promise<EventDetailResponse> {
    const url = process.env.NEXT_PUBLIC_AXL_GET_EVENT_URL
    if (!url) throw new Error("Falta NEXT_PUBLIC_AXL_GET_EVENT_URL")

    const res = await fetch(
        `${url}?eventId=${encodeURIComponent(eventId)}`,
        { cache: "no-store" }
    )
    if (!res.ok) throw new Error("Error cargando evento")
    return res.json()
}

export default async function Page() {
  const data = await axlGetEvent("axl-2026-fecha-1")
  return <RegisterToEventPage eventData={data} />
}