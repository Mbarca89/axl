import { Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2026 Argentinean Xball League. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/argentinaxball"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
              @argentinaxball
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
