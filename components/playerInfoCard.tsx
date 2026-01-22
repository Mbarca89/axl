"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, MapPin, Hash, User, Shield, Edit } from "lucide-react"
import Link from "next/link"
import { MeResponse } from "@/lib/axl-api"

interface PlayerInfoCardProps {
  user: MeResponse
}

export function PlayerInfoCard({ user }: PlayerInfoCardProps) {

  const responseUser = user.user

  const getInitials = (name: string, surname: string) => {
    return `${name?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase()
  }

  const formatBirthDate = (dateString?: string | null) => {
    if (!dateString) return "No especificada"

    const [y, m, d] = dateString.split("-").map(Number)

    const dt = new Date(y, m - 1, d)

    return dt.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const getPositionLabel = (position: string | null) => {
    const positions: Record<string, string> = {
      Front: "Front",
      Mid: "Mid",
      Back: "Back",
    }
    return position ? positions[position] || position : "No especificada"
  }

  const getSideLabel = (side: string | null) => {
    const sides: Record<string, string> = {
      Snake: "Snake",
      Doros: "Dorito",
      Centro: "Centro",
      Completo: "Completo",
    }
    return side ? sides[side] || side : "No especificado"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={responseUser.avatarUrl || undefined} alt={`${responseUser.firstname} ${responseUser.surname}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {getInitials(responseUser.firstname, responseUser.surname)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{responseUser.firstname} {responseUser.surname}</CardTitle>
            <CardDescription className="text-base">@{responseUser.username}</CardDescription>
            <Badge variant="secondary" className="mt-1">
              {responseUser.role}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/perfil/editar">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{responseUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p className="font-medium">{responseUser.phone || "No especificado"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">DNI</p>
              <p className="font-medium">{responseUser.dni || "No especificado"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Fecha de nacimiento</p>
              <p className="font-medium">{formatBirthDate(responseUser.birthDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Posición</p>
              <p className="font-medium">{getPositionLabel(responseUser.position ?? "")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Lado</p>
              <p className="font-medium">{getSideLabel(responseUser.side ?? "")}</p>
            </div>
          </div>

          {responseUser.number !== null && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground">Número</p>
                <p className="font-medium">#{responseUser.number}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
