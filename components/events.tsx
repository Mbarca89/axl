import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin } from "lucide-react"
import Image from "next/image"

export function Events() {
  const events = [
    {
      title: "1ª FECHA",
      date: "3 - 4 de Abril",
      location: "La Barranca Paintball - San Luis",
      image: "/images/fechas-20axl-20v2.png",
    },
    {
      title: "2ª FECHA",
      date: "15 - 16 de Agosto",
      location: "La Barranca Paintball - San Luis",
      image: "/images/fechas-20axl-20v2.png",
    },
    {
      title: "3ª FECHA",
      date: "21 - 22 de Noviembre",
      location: "La Barranca Paintball - San Luis",
      image: "/images/fechas-20axl-20v2.png",
    },
  ]

  return (
    <section id="eventos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{"Temporada 2026"}</h2>
          <p className="text-xl text-muted-foreground text-pretty">{"Tres fechas de pura acción y competencia"}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-muted">
                <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-primary">{event.title}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">{"D3/D4 5V5 XBALL - D4/D5 3V3 XBALL - D6 3V3 XBALL"}</p>
        </div>
      </div>
    </section>
  )
}
