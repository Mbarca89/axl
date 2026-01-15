import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-secondary-foreground">
      {/* ===== MOBILE ===== */}
      <div className="sm:hidden bg-white">
        <div className="min-h-[70svh] flex flex-col items-center justify-center">
          {/* Logo full width */}
          <div className="w-full">
            <Image
              src="/axl-logo.png"
              alt="AXL Logo"
              width={1594}
              height={2048}
              priority
              className="w-full h-auto"
            />
          </div>

          {/* Botones */}
          <div className="mt-6 w-full px-4 max-w-md">
            <div className="grid gap-3">
              <Button size="lg" asChild className="w-full text-lg">
                <Link href="/login">Registrarme Ahora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full text-lg text-primary">
                <Link href="#eventos">Ver Eventos</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP (solo banner + botones abajo) ===== */}
      <div className="hidden sm:block">
        {/* IMPORTANTE: el banner va como Image fill, NO como background inline */}
        <div className="relative min-h-[670px] lg:min-h-[calc(100vh-80px)]">
          <Image
            src="/banner.png"
            alt="AXL Banner"
            fill
            priority
            className="object-cover object-center"
          />
          {/* overlay leve para contraste */}
          <div className="absolute inset-0 bg-black/35" />

          {/* Contenido: botones abajo */}
          <div className="absolute inset-0 flex items-end justify-center pb-12">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
              <div className="flex gap-4">
                <Button size="lg" asChild className="text-lg">
                  <Link href="/login">Registrarme Ahora</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg bg-transparent">
                  <Link href="#eventos">Ver Eventos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
