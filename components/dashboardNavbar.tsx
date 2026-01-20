"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, User, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardNavbarProps {
  user: {
    firstname: string
    surname: string
    avatarUrl: string | null
    username: string
  }
  onLogout?: () => void
}

export function DashboardNavbar({ user, onLogout }: DashboardNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (firstname: string, surname: string) => {
    return `${firstname?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase()
  }

  const handleLogout = () => {
    onLogout?.()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/icon-dark-32x32.png" alt="AXL Logo" width={60} height={60} className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/player" className="text-sm font-medium transition-colors hover:text-primary">
              Inicio
            </Link>
            <Link href="/player/crear-equipo" className="text-sm font-medium transition-colors hover:text-primary">
              Crear equipo
            </Link>
            <Link href="/player/fechas" className="text-sm font-medium transition-colors hover:text-primary">
              Fechas
            </Link>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
                  <AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstname} ${user.surname}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {getInitials(user.firstname, user.surname)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstname} ${user.surname}`} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.firstname, user.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.firstname} {user.surname}</span>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Ver perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil/editar" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Editar perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstname} ${user.surname}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.firstname, user.surname)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} alt={`${user.firstname} ${user.surname}`} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.firstname, user.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.firstname} {user.surname}</span>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Ver perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil/editar" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Editar perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/dashboard"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/dashboard/crear-equipo"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Crear equipo
            </Link>
            <Link
              href="/dashboard/fechas"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fechas
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
