import Image from "next/image"

export function PageLoading({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Image src="/images/logo-800.webp" alt="Cargando..." width={100} height={100} className="animate-pulse" />
      <p className="text-sm text-muted-foreground">
        <strong>{label}</strong>
      </p>
    </div>
  )
}
