// app/(public)/layout.tsx

import { Navbar } from "@/components/navbar"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
        <Navbar/>
      <main>{children}</main>
    </div>
  )
}
