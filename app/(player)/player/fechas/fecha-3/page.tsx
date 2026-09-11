import FechaPage from "@/components/fecha1"
import { fecha3Config } from "@/lib/events"
import { getEventTeams } from "@/lib/event-server"

export default async function EventDetail() {
  const registrations = await getEventTeams(fecha3Config.eventId)
  return <FechaPage registrations={registrations} config={fecha3Config} />
}
