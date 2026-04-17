"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message || "Error al enviar el correo")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-emerald-500/10 p-3 rounded-full w-fit mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Correo enviado</h1>
          <p className="text-muted-foreground">
            Hemos enviado un enlace de recuperación a <span className="font-semibold">{email}</span>.
            Por favor, revisa tu bandeja de entrada.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full h-11 border-slate-200 dark:border-slate-800">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu cuenta
        </p>
      </div>
      <form onSubmit={handleReset} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="nombre@empresa.com"
              type="email"
              disabled={isLoading}
              required
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <Button className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-medium" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar enlace"}
        </Button>
      </form>
      
      <p className="text-center text-sm">
        <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-sky-500 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
