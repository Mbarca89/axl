"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/icon-dark-32x32.png" alt="AXL Logo" width={60} height={60} className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Inicio
            </Link>
            <a href="/REGLAMENTO.pdf" download className="text-sm font-medium transition-colors hover:text-primary">
              Reglamento
            </a>
            <Link href="#eventos" className="text-sm font-medium transition-colors hover:text-primary">
              Eventos
            </Link>
            <Button asChild>
              <Link href="/login" >Ingresar</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button type="button" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <a
              href="/reglamento.pdf"
              download
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reglamento
            </a>
            <Link
              href="#eventos"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Eventos
            </Link>
            <Button asChild className="w-full">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Ingresar
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
