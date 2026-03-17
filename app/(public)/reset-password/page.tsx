import { Suspense } from "react"
import ResetPasswordForm from "@/components/ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}