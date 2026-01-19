"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { axlLogin, axlRegister } from "@/lib/axl-api"

const usernameSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-zA-Z0-9_-]+$/, "Solo letras, números, _ o -")

const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, "Ingresá usuario o email"),
  password: z.string().min(6, "Mínimo 6 caracteres"), // tu backend hoy acepta 123456
})

const registerSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6, "Mínimo 6 caracteres"),
  nombre: z.string().min(2, "Ingresá tu nombre"),
  apellido: z.string().min(2, "Ingresá tu apellido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  dni: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  posicion: z.enum(["front", "mid", "back"]).optional(),
  lado: z.enum(["snake", "doros", "centro", "completo"]).optional(),
})

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

function saveToken(token: string) {
  localStorage.setItem("axl_token", token)
}

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { usernameOrEmail: "", password: "" },
    mode: "onTouched",
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      dni: "",
      fechaNacimiento: "",
      posicion: undefined,
      lado: undefined,
    },
    mode: "onTouched",
  })

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGlobalError(null)

    const ok = await loginForm.trigger()
    if (!ok) return

    setIsLoading(true)
    try {
      const v = loginForm.getValues()

      const res = await axlLogin({
        login: v.usernameOrEmail,
        password: v.password,
      })

      saveToken(res.token)
      router.push("/player")
      router.refresh()
    } catch (err: any) {
      setGlobalError(err?.message ?? "No se pudo iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGlobalError(null)

    const ok = await registerForm.trigger()
    if (!ok) return

    setIsLoading(true)
    try {
      const v = registerForm.getValues()

      // 1) Registrar (tu lambda NO devuelve token)
      await axlRegister({
        username: v.username,
        email: v.email,
        password: v.password,
        name: v.nombre,
        surname: v.apellido,
        // opcionales si tu backend los soporta luego:
        phone: v.telefono || undefined,
        dni: v.dni || undefined,
        birthDate: v.fechaNacimiento || undefined,
        position: v.posicion || undefined,
        side: v.lado || undefined,
      })

      // 2) Auto-login con username (o email) + password recién creados
      const loginRes = await axlLogin({
        login: v.username, // podés usar v.email si preferís
        password: v.password,
      })

      saveToken(loginRes.token)
      router.push("/player")
      router.refresh()
    } catch (err: any) {
      setGlobalError(err?.message ?? "No se pudo registrar")
    } finally {
      setIsLoading(false)
    }
  }

  const le = loginForm.formState.errors
  const re = registerForm.formState.errors

  console.log("LOGIN URL:", process.env.NEXT_PUBLIC_AXL_LOGIN_URL)


  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>

        {globalError ? (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
            {globalError}
          </div>
        ) : null}

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Usuario o email</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="mauricio o mauricio@test.com"
                    {...loginForm.register("usernameOrEmail")}
                  />
                  {le.usernameOrEmail ? <p className="text-sm text-destructive">{le.usernameOrEmail.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                  />
                  {le.password ? <p className="text-sm text-destructive">{le.password.message}</p> : null}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Crear Cuenta</CardTitle>
              <CardDescription>Completa tus datos para unirte a la liga</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Usuario *</Label>
                    <Input id="register-username" type="text" placeholder="tu_usuario" {...registerForm.register("username")} />
                    {re.username ? <p className="text-sm text-destructive">{re.username.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña *</Label>
                    <Input id="register-password" type="password" placeholder="••••••••" {...registerForm.register("password")} />
                    {re.password ? <p className="text-sm text-destructive">{re.password.message}</p> : null}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nombre">Nombre *</Label>
                    <Input id="register-nombre" type="text" placeholder="Mauricio" {...registerForm.register("nombre")} />
                    {re.nombre ? <p className="text-sm text-destructive">{re.nombre.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-apellido">Apellido *</Label>
                    <Input id="register-apellido" type="text" placeholder="Barca" {...registerForm.register("apellido")} />
                    {re.apellido ? <p className="text-sm text-destructive">{re.apellido.message}</p> : null}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input id="register-email" type="email" placeholder="mauricio@test.com" {...registerForm.register("email")} />
                    {re.email ? <p className="text-sm text-destructive">{re.email.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-telefono">Teléfono</Label>
                    <Input id="register-telefono" type="tel" placeholder="+54 9 ..." {...registerForm.register("telefono")} />
                  </div>
                </div>

                {/* Estos campos los dejé opcionales porque tu register lambda hoy no los muestra en el payload mínimo */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-dni">DNI</Label>
                    <Input id="register-dni" type="text" placeholder="12345678" {...registerForm.register("dni")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-fecha-nacimiento">Fecha de Nacimiento</Label>
                    <Input id="register-fecha-nacimiento" type="date" {...registerForm.register("fechaNacimiento")} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-posicion">Posición</Label>
                    <Select
                      value={registerForm.watch("posicion")}
                      onValueChange={(v) => registerForm.setValue("posicion", v as any)}
                    >
                      <SelectTrigger id="register-posicion">
                        <SelectValue placeholder="Selecciona tu posición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front">Front</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-lado">Lado</Label>
                    <Select
                      value={registerForm.watch("lado")}
                      onValueChange={(v) => registerForm.setValue("lado", v as any)}
                    >
                      <SelectTrigger id="register-lado">
                        <SelectValue placeholder="Selecciona tu lado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="snake">Snake</SelectItem>
                        <SelectItem value="doros">Doros</SelectItem>
                        <SelectItem value="centro">Centro</SelectItem>
                        <SelectItem value="completo">Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Crear Cuenta"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
