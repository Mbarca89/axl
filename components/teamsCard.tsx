"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Crown, UserCheck, MapPin, Plus } from "lucide-react"
import Link from "next/link"
import { Team } from "@/lib/axl-api"
import Image from "next/image"

interface TeamsCardProps {
  ownedTeams: Team[]
  memberTeams: Team[]
}

export function TeamsCard({ ownedTeams, memberTeams }: TeamsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const hasTeams = ownedTeams.length > 0 || memberTeams.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mis Equipos
          </CardTitle>
          <CardDescription>Equipos de los que eres dueño o miembro</CardDescription>
        </div>
        <Button asChild>
          <Link href="/player/crear-equipo">
            <Plus className="h-4 w-4 mr-1" />
            Crear equipo
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!hasTeams ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aún no perteneces a ningún equipo.</p>
            <p className="text-sm mt-1">Crea tu propio equipo o espera una invitación.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Owned Teams */}
            {ownedTeams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Equipos propios
                </h4>
                <div className="space-y-3">
                  {ownedTeams.map((team) => (
                    <TeamItem key={team.teamId} team={team} isOwner formatDate={formatDate} />
                  ))}
                </div>
              </div>
            )}

            {/* Member Teams */}
            {memberTeams.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Miembro de
                </h4>
                <div className="space-y-3">
                  {memberTeams.map((team) => (
                    <TeamItem key={team.teamId} team={team} isOwner={false} formatDate={formatDate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TeamItemProps {
  team: Team
  isOwner: boolean
  formatDate: (date: string) => string
}

function TeamItem({ team, isOwner, formatDate }: TeamItemProps) {

  const getInitials = (name: string) => {
    return `${name?.charAt(0) || ""}`.toUpperCase()
  }

  return (
    <Link
      href={`/dashboard/equipo/${team.teamId}`}
      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
          <Avatar className="h-15 w-15">
            {team.logoUrl ? (
              <Image
                src={team.logoUrl}
                alt={team.teamName}
                width={70}
                height={70}
                className="object-contain"
              />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(team.teamName)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h5 className="font-semibold">{team.teamName}</h5>
            {isOwner ? (
              <Badge variant="default" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Dueño
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {team.teamRole}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>{team.province}, {team.country}</span>
          </div>
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground hidden sm:block">
        <p>Miembro desde</p>
        <p className="font-medium">{formatDate(team.joinedAt)}</p>
      </div>
    </Link>
  )
}
