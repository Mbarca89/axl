"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Loader2, UploadCloud, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { axlPresignTeamLogo, uploadToPresignedUrl } from "@/lib/axl-api"
import { useDashboard } from "@/components/DashboardProvider"



// Reutilizable: compresión para logos (cuadrado, liviano)
async function compressTeamLogo(file: File, opts?: { size?: number; quality?: number }) {
    const size = opts?.size ?? 512  // suficiente y liviano
    const quality = opts?.quality ?? 0.82

    const img = await createImageBitmap(file)

    // hacemos crop cuadrado centrado (logo suele verse mejor así)
    const minSide = Math.min(img.width, img.height)
    const sx = Math.floor((img.width - minSide) / 2)
    const sy = Math.floor((img.height - minSide) / 2)

    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No se pudo crear canvas")

    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)

    // Para logos conviene PNG si querés transparencia,
    // pero pesa más. Si querés ultra liviano: JPEG.
    // Yo te recomiendo WEBP si aceptás: liviano y soportado.
    const outType = "image/webp"

    const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("No se pudo comprimir imagen"))),
            outType,
            quality
        )
    })

    return { blob, contentType: outType }
}

export default function UploadTeamLogoPage() {

    const { refreshTeams } = useDashboard()


    const router = useRouter()
    const params = useParams<{ teamId: string }>()
    const teamId = params.teamId

    const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("axl_token") : null), [])

    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    const onPick = (f: File | null) => {
        setFile(f)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(f ? URL.createObjectURL(f) : null)
    }

    const validateFile = (f: File) => {
        const okTypes = ["image/jpeg", "image/png", "image/webp"]
        if (!okTypes.includes(f.type)) throw new Error("Formato no soportado. Usá JPG, PNG o WebP.")
        if (f.size > 12 * 1024 * 1024) throw new Error("La imagen es muy pesada (>12MB). Elegí otra más liviana.")
    }

    const handleUpload = async () => {
        if (!token) {
            toast.error("Sesión vencida. Volvé a iniciar sesión.")
            router.replace("/login")
            return
        }
        if (!file) return

        try {
            validateFile(file)
            setUploading(true)

            // 1) Comprimir (square crop + resize)
            const { blob, contentType } = await compressTeamLogo(file, { size: 512, quality: 0.82 })

            // 2) Presign (tu lambda recibe teamId + contentType)
            const presign = await axlPresignTeamLogo(token, teamId, contentType)

            // 3) Upload PUT a S3
            await uploadToPresignedUrl(presign.uploadUrl, blob, contentType)

            toast.success("Logo subido correctamente")

            // 4) volver al detalle del equipo y refrescar
            await refreshTeams()
            router.push(`/player/equipo/${teamId}`)
            router.refresh()
        } catch (e: any) {
            toast.error(e?.message ?? "No se pudo subir el logo")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.back()} className="gap-2 cursor-pointer">
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Logo del equipo</CardTitle>
                    <CardDescription>Subí un logo cuadrado y liviano. Se optimiza automáticamente.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="h-24 w-24 rounded-lg border bg-muted/30 flex items-center justify-center overflow-hidden">
                            {previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="text-xs text-muted-foreground text-center px-2">Sin vista previa</div>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <Label htmlFor="logo">Seleccionar imagen</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                                disabled={uploading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Formatos: JPG / PNG / WebP. Recomendado: imagen cuadrada, centrada.
                            </p>
                        </div>
                    </div>

                    <Button className="w-full gap-2 cursor-pointer" onClick={handleUpload} disabled={!file || uploading}>
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="h-4 w-4" />
                                Subir logo
                            </>
                        )}
                    </Button>

                    <div className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Recomendaciones
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Preferible cuadrado (1:1) y con el logo centrado.</li>
                            <li>Evitá texto muy finito (se pierde en tamaños chicos).</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
