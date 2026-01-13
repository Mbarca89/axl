"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Aquí conectarás con tu backend
    console.log("Login submit")
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Aquí conectarás con tu backend
    console.log("Register submit")
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>{"Ingresa tus credenciales para acceder"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Usuario</Label>
                  <Input id="login-username" name="username" type="text" placeholder="tu_usuario" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
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
              <CardDescription>{"Completa tus datos para unirte a la liga"}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Usuario *</Label>
                    <Input id="register-username" name="username" type="text" placeholder="tu_usuario" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña *</Label>
                    <Input id="register-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nombre">Nombre *</Label>
                    <Input id="register-nombre" name="nombre" type="text" placeholder="Juan" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-apellido">Apellido *</Label>
                    <Input id="register-apellido" name="apellido" type="text" placeholder="Pérez" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input id="register-email" name="email" type="email" placeholder="tu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-telefono">Teléfono *</Label>
                    <Input
                      id="register-telefono"
                      name="telefono"
                      type="tel"
                      placeholder="+54 9 11 1234-5678"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-dni">DNI *</Label>
                    <Input id="register-dni" name="dni" type="text" placeholder="12345678" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-fecha-nacimiento">Fecha de Nacimiento *</Label>
                    <Input id="register-fecha-nacimiento" name="fechaNacimiento" type="date" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-posicion">Posición *</Label>
                    <Select name="posicion" required>
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
                    <Label htmlFor="register-lado">Lado *</Label>
                    <Select name="lado" required>
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
