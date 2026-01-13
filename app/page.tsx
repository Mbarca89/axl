import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Events } from "@/components/events"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Events />
      </main>
      <Footer />
    </div>
  )
}
