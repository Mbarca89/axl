import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center bg-secondary text-secondary-foreground overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('/paintball-action-players-shooting.jpg')`,
        }}
      />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance tracking-tight">
          ARGENTINEAN <span className="text-primary">XBALL</span> LEAGUE
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto text-pretty">
          {"Unete a la liga de paintball más competitiva de Argentina"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-lg">
            <Link href="/login">Registrarme Ahora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg bg-transparent">
            <Link href="#eventos">Ver Eventos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
