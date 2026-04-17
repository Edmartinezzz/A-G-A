"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SocialAuth } from "@/components/auth/social-auth"
import { Loader2, Mail, Lock, User, Building2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Sign up the user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // 2. Create the profile entry (the RLS policy should allow this)
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            company_name: companyName,
          })

        if (profileError) {
          console.warn("Error creating profile:", profileError)
          // We don't throw here because the user is already created in Auth
        }
      }

      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message || "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-emerald-500/10 p-3 rounded-full w-fit mx-auto">
          <Mail className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">¡Cuenta creada con éxito!</h1>
          <p className="text-muted-foreground">
            Has recibido un correo de confirmación en <span className="font-semibold text-slate-900 dark:text-slate-100">{email}</span>.
            Por favor, verifica tu email para continuar.
          </p>
        </div>
        <Button asChild className="w-full h-11 bg-sky-600 hover:bg-sky-700">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Únete a A-G-A y optimiza tus operaciones aduanales
        </p>
      </div>
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombre"
                disabled={isLoading}
                required
                className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Empresa"
                disabled={isLoading}
                required
                className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
        </div>

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

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Contraseña (mín. 8 caracteres)"
              type="password"
              disabled={isLoading}
              required
              minLength={8}
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-lg shadow-sky-500/20" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear cuenta"}
        </Button>
      </form>
      
      <SocialAuth />

      <p className="px-8 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-sky-500 font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
