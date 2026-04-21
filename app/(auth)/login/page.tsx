"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SocialAuth } from "@/components/auth/social-auth"
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)]">
           <Sparkles className="h-3 w-3 animate-pulse text-indigo-300" />
           <span>Acceso Prioritario</span>
        </div>
        <h1 className="text-4xl md:text-[2.75rem] font-syne font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 drop-shadow-md">
          Bienvenido
        </h1>
        <p className="text-slate-400 font-pjs font-medium text-sm leading-relaxed">
          Ingresa al centro de mando de <span className="text-indigo-300 font-bold">A-G-A</span>.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-premium border-rose-500/20 bg-rose-500/5 text-rose-400 text-[11px] font-pjs font-bold p-4 rounded-2xl flex items-center gap-3 tracking-wide"
          >
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            {error}
          </motion.div>
        )}
        
        <div className="space-y-5">
          <div className="space-y-2 group">
            <label className="text-[10px] font-pjs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-indigo-400 transition-colors">Identificador (Email)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="email"
                placeholder="nombre@aga.ai"
                type="email"
                disabled={isLoading}
                required
                className="w-full h-14 pl-12 pr-4 bg-[#02040a]/50 backdrop-blur-md border border-white/10 rounded-[1.25rem] text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-pjs shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] hover:bg-[#02040a]/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-pjs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 group-focus-within:text-indigo-400 transition-colors">Clave de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                id="password"
                placeholder="••••••••"
                type="password"
                disabled={isLoading}
                required
                className="w-full h-14 pl-12 pr-4 bg-[#02040a]/50 backdrop-blur-md border border-white/10 rounded-[1.25rem] text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-pjs shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] hover:bg-[#02040a]/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end pr-1 mt-1">
              <Link 
                href="/forgot-password" 
                className="text-[10px] text-slate-500 hover:text-indigo-400 font-pjs font-bold uppercase tracking-widest transition-colors"
              >
                ¿Perdiste la clave?
              </Link>
            </div>
          </div>
        </div>

        <Button 
          className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-[#02040a] font-pjs font-bold rounded-[1.25rem] shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all hover:scale-[1.02] active:scale-95 group uppercase tracking-widest text-sm relative overflow-hidden" 
          disabled={isLoading}
        >
          {/* Light Sweep */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <span className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Establecer Conexión
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
              </>
            )}
          </span>
        </Button>
      </form>
      
      <SocialAuth />

      <p className="text-center text-[11px] font-pjs font-bold text-slate-500 uppercase tracking-[0.1em]">
        ¿Nuevo en la red?{" "}
        <Link href="/signup" className="text-indigo-300 hover:text-emerald-400 transition-colors underline-offset-4 underline decoration-indigo-500/30">
          Obtener cuenta Pro
        </Link>
      </p>
    </div>
  )
}
