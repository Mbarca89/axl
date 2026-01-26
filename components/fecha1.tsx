
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, MapPin, Trophy, Ticket, Clock, ShieldCheck, Car, Utensils, Store, Coffee, Info, ExternalLink } from "lucide-react"
import { Navbar } from "@/components/navbar"

function Money({ v }: { v: number }) {
    return <span className="font-semibold">${v}</span>
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-sm font-medium">{value}</div>
            </div>
        </div>
    )
}

export default function Fecha1Page() {
    const fecha = {
        titulo: "Fecha 1",
        dias: "3 y 4 de abril",
        sede: "La Barranca Paintball",
        ciudad: "San Luis",
    }

    const categorias = [
        {
            name: "5v5 D4/D3",
            marker: "M700",
            time: "8 minutos",
            format: "Race-To-3",
            prices: { before: 700, after: 800 },
            prizes: { first: 1000, second: 700, third: 350 },
        },
        {
            name: "3v3 D5",
            marker: "M500",
            time: "5 minutos",
            format: "Race-To-3",
            prices: { before: 350, after: 450 },
            prizes: { first: 500, second: 350, third: 175 },
        },
        {
            name: "3v3 D6",
            marker: "M500",
            time: "5 minutos",
            format: "Race-To-2",
            prices: { before: 300, after: 400 },
            prizes: { first: 400, second: 200, third: 150 },
        },
    ] as const

    const amenities = [
        { icon: <Car className="h-4 w-4" />, text: "Estacionamiento cerrado" },
        { icon: <ShieldCheck className="h-4 w-4" />, text: "Baños" },
        { icon: <Utensils className="h-4 w-4" />, text: "Cantina" },
        { icon: <Store className="h-4 w-4" />, text: "Varios comercios cercanos" },
    ]

    return (
        <div className="min-h-screen flex flex-col">
            <div className="container mx-auto px-4 py-8">
                {/* HERO */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{fecha.titulo}</h1>
                            <p className="text-muted-foreground mt-1">
                                Argentinean XBall League · Temporada 2026
                            </p>
                        </div>

                        <Badge variant="secondary" className="text-sm">
                            Layout disponible el <span className="ml-1 font-semibold">20 de marzo</span>
                        </Badge>
                    </div>

                    <Card>
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <InfoRow
                                    icon={<CalendarDays className="h-4 w-4" />}
                                    label="Fecha"
                                    value={fecha.dias}
                                />
                                <InfoRow
                                    icon={<MapPin className="h-4 w-4" />}
                                    label="Sede"
                                    value={`${fecha.sede} · ${fecha.ciudad}`}
                                />
                                <div className="flex items-center justify-start sm:justify-end">
                                    <Link href={"/player"}>
                                        <Button className="w-full sm:w-auto cursor-pointer" onClick={() => { }}>
                                            Inscribirme
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <Separator className="my-5" />

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Ticket className="h-4 w-4" />
                                        Inscripciones
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Las inscripciones se encuentran abiertas a partir del 1 de febrero.
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Los roster deben estar completos antes del 20 de marzo
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-card p-4">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Trophy className="h-4 w-4" />
                                        Premios
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Todas las categorías incluyen <span className="font-medium">efectivo, trofeo y medallas</span> y regalos de sponsors.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CATEGORÍAS */}
                <div className="mt-8 space-y-4">
                    <h2 className="text-xl font-semibold">Categorías</h2>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {categorias.map((c) => (
                            <Card key={c.name} className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg">{c.name}</CardTitle>
                                    <CardDescription>Formato de juego</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid gap-3">
                                        <InfoRow
                                            icon={""}
                                            label="Tiempo de juego"
                                            value={c.time}
                                        />
                                        <InfoRow
                                            icon={""}
                                            label="Límite de pintura"
                                            value={c.marker}
                                        />
                                        <InfoRow
                                            icon={""}
                                            label="Formato"
                                            value={c.format}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-semibold">Inscripción (USD)</div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Hasta el 3 de marzo</span>
                                            <Money v={c.prices.before} />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Después del 3 de marzo</span>
                                            <Money v={c.prices.after} />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="text-sm font-semibold">Premios en efectivo (USD)</div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">1º puesto</span>
                                            <Money v={c.prizes.first} />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">2º puesto</span>
                                            <Money v={c.prizes.second} />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">3º puesto</span>
                                            <Money v={c.prizes.third} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AMENITIES */}
                <div className="mt-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>El predio</CardTitle>
                            <CardDescription>Comodidades disponibles durante el evento</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {amenities.map((a) => (
                                    <div
                                        key={a.text}
                                        className="flex items-center gap-3 rounded-lg border bg-card p-3"
                                    >
                                        <div className="text-muted-foreground">{a.icon}</div>
                                        <div className="text-sm font-medium">{a.text}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MAPA */}
                <div id="mapa" className="mt-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ubicación</CardTitle>
                            <CardDescription>
                                {fecha.sede} · {fecha.ciudad}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-xl border bg-muted/20">
                                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                                    <iframe
                                        className="absolute inset-0 h-full w-full"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d236.27381992565904!2d-66.31445457322104!3d-33.286155661141876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43de196da20cf%3A0x920fbb9c4212072!2sLa%20Barranca%20Paintball!5e1!3m2!1ses-419!2sar!4v1769353107035!5m2!1ses-419!2sar"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        allowFullScreen
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link href={"/player"}>
                                    <Button className="cursor-pointer" onClick={() => { }}>
                                        Inscribirme
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <section className="mt-10 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Alojamientos</h2>
                        <p className="text-muted-foreground mt-1">
                            Recomendaciones para quienes viajan a la fecha.
                        </p>
                    </div>

                    {/* Destacado */}
                    <Card className="border-primary/40">
                        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-xl">Hotel Intihuasi</CardTitle>
                                    <Badge variant="secondary">Recomendado</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    A 5 cuadras del predio • Cochera • Desayuno buffet
                                </p>
                            </div>

                            <Button asChild className="sm:mt-0">
                                <Link href="https://www.intihuasihotel.com.ar/" target="_blank" rel="noreferrer">
                                    Ver sitio <ExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="grid gap-4 lg:grid-cols-[1fr_320px] items-start">
                            <div className="space-y-3">
                                <div className="grid gap-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <p>
                                            <span className="font-medium">Precio (Sujeto a cambios):</span>{" "}
                                            $25.500 por persona, por día informando al reservar que asistís al torneo de la AXL.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>San Luis (cerca de La Barranca Paintball)</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Car className="h-4 w-4 text-muted-foreground" />
                                        <span>Cochera</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Coffee className="h-4 w-4 text-muted-foreground" />
                                        <span>Desayuno buffet</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Nota: precios y disponibilidad pueden variar. Confirmá al reservar.
                                </p>
                            </div>

                            {/* Mapa chico */}
                            <div className="rounded-xl overflow-hidden border bg-card">
                                <div className="aspect-[4/3] w-full">
                                    <iframe
                                        title="Hotel Intihuasi - Mapa"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d472.53673916931143!2d-66.31249678818313!3d-33.288168752989066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43ebb734e5c15%3A0xaacc198d3f9d01b8!2sHotel%20Intihuasi!5e1!3m2!1ses-419!2sar!4v1769445312580!5m2!1ses-419!2sar"
                                        className="h-full w-full"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Otros alojamientos (placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Otros alojamientos cercanos<p className="text-sm text-muted-foreground mt-1">
                                *Solo a modo informativo, no tienen relación alguna con la AXL ni su organización.
                            </p></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <a
                                        href="https://maps.app.goo.gl/UVXAEnxaYzRsMXPS8"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium hover:underline"
                                    >
                                        Hospedaje Edén
                                    </a>
                                    <span className="text-muted-foreground">📞 2664 402114</span>
                                </li>

                                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <a
                                        href="https://delcamino.hotelsanluis.net/es/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium hover:underline"
                                    >
                                        Hotel Del Camino
                                    </a>
                                    <span className="text-muted-foreground">📞 2664 758795</span>
                                </li>

                                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <a
                                        href="https://www.facebook.com/hosterialacasonasanluis?locale=es_LA"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium hover:underline"
                                    >
                                        Hostería La Casona
                                    </a>
                                    <span className="text-muted-foreground">📞 2664 447250</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <a
                                        href="https://maps.app.goo.gl/hB2aVHi8RBSwrRjg8"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium hover:underline"
                                    >
                                        El Amparo Hotel
                                    </a>
                                    <span className="text-muted-foreground">📞 2664 431795</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <a
                                        href="https://puntalavalle.hotelsanluis.net/es/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium hover:underline"
                                    >
                                        Hotel Punta Lavalle
                                    </a>
                                    <span className="text-muted-foreground">📞 2665 127932</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>
                <div className="mt-10 text-xs text-muted-foreground">
                    * Valores expresados en USD. Layout disponible el 20 de marzo.
                </div>
            </div>
        </div>
    )
}
