import FechaPage from "@/components/fecha1"
import { fecha1Config } from "@/lib/events"
import { getEventTeams } from "@/lib/event-server"

export default async function EventDetail() {
  const registrations = await getEventTeams(fecha1Config.eventId)
  return <FechaPage registrations={registrations} config={fecha1Config} />
}
