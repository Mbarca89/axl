"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Loader2, UploadCloud, ArrowLeft, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { axlPresignAvatar, uploadToPresignedUrl } from "@/lib/axl-api"
import { useDashboard } from "@/components/DashboardProvider"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
type AcceptedType = (typeof ACCEPTED_TYPES)[number]

// Resize + compress en el browser (sin libs)
async function compressAvatar(file: File, opts?: { maxSize?: number; quality?: number }) {
  const maxSize = opts?.maxSize ?? 900 // 900px alcanza para carnet (re bien)
  const quality = opts?.quality ?? 0.82 // equilibrio buenísimo

  // decode
  const img = await createImageBitmap(file)

  // calcular escala manteniendo aspect ratio
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No se pudo crear canvas")

  ctx.drawImage(img, 0, 0, w, h)

  // elegimos jpeg para ahorrar peso (ideal avatar)
  const outType = "image/jpeg"
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo comprimir imagen"))),
      outType,
      quality
    )
  })

  return { blob, contentType: outType }
}

export default function UploadAvatarPage() {
  const router = useRouter()
  const { refresh, logout } = useDashboard()

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
    if (!ACCEPTED_TYPES.includes(f.type as AcceptedType)) {
      throw new Error("Formato no soportado. Usá JPG, PNG o WebP.")
    }
    // límite “humano” antes de comprimir (evita colgar el browser)
    const maxRawMB = 12
    if (f.size > maxRawMB * 1024 * 1024) {
      throw new Error(`La imagen es muy pesada (>${maxRawMB}MB). Elegí otra más liviana.`)
    }
  }

  const handleUpload = async () => {
    if (!token) {
      toast.error("Sesión vencida. Volvé a iniciar sesión.")
      logout()
      return
    }
    if (!file) return

    try {
      validateFile(file)
      setUploading(true)

      // 1) Comprimir/resize local
      const { blob, contentType } = await compressAvatar(file, { maxSize: 900, quality: 0.82 })

      // 2) Pedir URL firmada (S3 presigned)
      const presign = await axlPresignAvatar(token, contentType)

      // 3) Subir a S3 directo
      await uploadToPresignedUrl(presign.uploadUrl, blob, contentType)

      toast.success("Foto subida correctamente")

      // 4) Refrescar datos (si tu backend actualiza avatarUrl al presign o al upload)
      await refresh()

      router.push("/player")
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo subir la foto")
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
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>Subí una foto clara para tu perfil y futuro carnet.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preview */}
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
              <Label htmlFor="avatar">Seleccionar imagen</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Formatos: JPG / PNG / WebP. La imagen se optimiza automáticamente antes de subir.
              </p>
            </div>
          </div>

          <Button
            className="w-full gap-2 cursor-pointer"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Subir foto
              </>
            )}
          </Button>

          {/* Tips */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Recomendaciones
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Foto en posición vertical (retrato), con la cara centrada.</li>
              <li>Buena iluminación de frente (evitá contraluz).</li>
              <li>Fondo simple y prolijo.</li>
              <li>Sin accesorios que tapen la cara (lentes de sol, máscara, etc.).</li>
              <li>Sin filtros fuertes; que se vea natural.</li>
              <li>Ideal: desde el pecho hacia arriba, mirando a cámara.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
