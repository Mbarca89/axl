"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { axlCreateTeam } from "@/lib/axl-api"
import { CountrySelect } from "@/components/CountrySelect"

export default function CreateTeamPage() {
    const router = useRouter()

    const [teamName, setTeamName] = useState("")
    const [country, setCountry] = useState<string | null>("AR")
    const [province, setProvince] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isValid =
        teamName.trim().length > 0 &&
        Boolean(country) &&
        province.trim().length > 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValid) return

        const token = localStorage.getItem("axl_token")
        if (!token) {
            router.replace("/login")
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (!country) {
                setError("Seleccioná un país")
                return
            }

            await axlCreateTeam(token, {
                teamName: teamName.trim(),
                country,
                province: province.trim(),
            })

            // éxito → volver al dashboard
            router.push("/player")
        } catch (e: any) {
            setError(e?.message ?? "Error creando el equipo")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-xl">
            <Card>
                <CardHeader>
                    <CardTitle>Crear equipo</CardTitle>
                    <CardDescription>
                        Completá los datos para registrar un nuevo equipo en la liga
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="teamName">Nombre del equipo *</Label>
                            <Input
                                id="teamName"
                                placeholder="Nombre"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>País *</Label>
                            <CountrySelect
                                value={country}
                                onChange={setCountry}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="province">Provincia *</Label>
                            <Input
                                id="province"
                                placeholder="Provincia"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={!isValid || loading}>
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creando equipo...
                                </span>
                            ) : (
                                "Crear equipo"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
