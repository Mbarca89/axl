import FechaPage from "@/components/fecha1"
import { fecha2Config } from "@/lib/events"
import { getEventTeams } from "@/lib/event-server"

export default async function EventDetail() {
  const registrations = await getEventTeams(fecha2Config.eventId)
  return <FechaPage registrations={registrations} config={fecha2Config} />
}
