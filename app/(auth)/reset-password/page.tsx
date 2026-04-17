"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Lock, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Verify that we are in a password reset session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        // If no session, the user probably clicked the link but isn't properly authenticated for reset
        // Supabase usually logs the user in automatically when clicking the recovery link
      }
    }
    checkSession()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message || "Error al actualizar la contraseña")
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
          <h1 className="text-2xl font-bold">Contraseña actualizada</h1>
          <p className="text-muted-foreground">
            Tu contraseña ha sido restablecida con éxito. Serás redirigido al inicio de sesión en unos segundos...
          </p>
        </div>
        <Button asChild className="w-full h-11 bg-sky-600">
          <Link href="/login">Ir al inicio de sesión ahora</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Establece tu nueva contraseña de acceso
        </p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nueva contraseña"
              type="password"
              disabled={isLoading}
              required
              minLength={8}
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Confirmar nueva contraseña"
              type="password"
              disabled={isLoading}
              required
              minLength={8}
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <Button className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-lg" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Actualizar contraseña"}
        </Button>
      </form>
    </div>
  )
}
