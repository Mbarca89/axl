"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Save, ArrowLeft } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { axlUpdateMe, type UpdateMeRequest } from "@/lib/axl-api"
import { useDashboard } from "@/components/DashboardProvider"

const playerCodeRegex = /^\d{5}-\d{4}$/ // por si lo querés mostrar/validar

const schema = z.object({
  firstname: z.string().min(2, "Ingresá tu nombre"),
  surname: z.string().min(2, "Ingresá tu apellido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  dni: z.string().optional(),
  birthDate: z.string().optional(), // "YYYY-MM-DD" desde input date
  position: z.enum(["Front", "Mid", "Back"]).optional(),
  side: z.enum(["Snake", "Doros", "Centro", "Completo"]).optional(),
  number: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined) return undefined
      const n = typeof v === "number" ? v : Number(v)
      return Number.isNaN(n) ? undefined : n
    },
    z.number().int().min(0).max(99).optional()
  ),
})

type FormValues = z.infer<typeof schema>

export default function EditProfileForm() {
  const router = useRouter()
  const { me, refresh, logout } = useDashboard()
  const [saving, setSaving] = useState(false)

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("axl_token") : null), [])

  const u = me?.user

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: "",
      surname: "",
      email: "",
      phone: "",
      dni: "",
      birthDate: "",
      position: undefined,
      side: undefined,
      number: undefined,
    },
    mode: "onTouched",
  })

  // precarga
  useEffect(() => {
    if (!u) return
    form.reset({
      firstname: u.firstname ?? "",
      surname: u.surname ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      dni: u.dni ?? "",
      birthDate: u.birthDate ?? "", // viene "YYYY-MM-DD" (perfecto para input date)
      position: (u.position as any) ?? undefined,
      side: (u.side as any) ?? undefined,
      number: u.number != null ? Number(u.number) : undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u?.userId])

  const onSubmit = async (v: FormValues) => {
    if (!token) {
      toast.error("Sesión vencida. Volvé a iniciar sesión.")
      logout()
      return
    }

    setSaving(true)
    try {
      const payload: UpdateMeRequest = {
        firstname: v.firstname,
        surname: v.surname,
        email: v.email,
        phone: v.phone?.trim() ? v.phone.trim() : null,
        dni: v.dni?.trim() ? v.dni.trim() : null,
        birthDate: v.birthDate?.trim() ? v.birthDate : null,
        position: (v.position as any) ?? null,
        side: (v.side as any) ?? null,
        number: typeof v.number === "number" ? v.number : null,
      }

      await axlUpdateMe(token, payload)
      toast.success("Perfil actualizado")
      await refresh() // actualiza navbar + panel
      router.push("/player")
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  if (!me) {
    return (
      <div className="container mx-auto px-4 py-10 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  const e = form.formState.errors

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar perfil</CardTitle>
          <CardDescription>Actualizá tus datos de jugador</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre / Apellido */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...form.register("firstname")} />
                {e.firstname && <p className="text-sm text-destructive">{e.firstname.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...form.register("surname")} />
                {e.surname && <p className="text-sm text-destructive">{e.surname.message}</p>}
              </div>
            </div>

            {/* Email / Tel */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
                {e.email && <p className="text-sm text-destructive">{e.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="+54 9 ..." {...form.register("phone")} />
              </div>
            </div>

            {/* DNI / Birth */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DNI</Label>
                <Input {...form.register("dni")} />
              </div>

              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input type="date" {...form.register("birthDate")} />
              </div>
            </div>

            {/* Posición / Lado */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posición</Label>
                <Select
                  value={form.watch("position")}
                  onValueChange={(v) => form.setValue("position", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Front">Front</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Back">Back</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lado</Label>
                <Select
                  value={form.watch("side")}
                  onValueChange={(v) => form.setValue("side", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Snake">Snake</SelectItem>
                    <SelectItem value="Doros">Doros</SelectItem>
                    <SelectItem value="Centro">Centro</SelectItem>
                    <SelectItem value="Completo">Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Número */}
            <div className="space-y-2">
              <Label>Número (opcional)</Label>
              <Input type="number" placeholder="Ej: 89" {...form.register("number")} />
              {e.number && <p className="text-sm text-destructive">{e.number.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-2 cursor-pointer" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
