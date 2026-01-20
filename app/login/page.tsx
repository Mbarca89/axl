import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/loginForm"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}
