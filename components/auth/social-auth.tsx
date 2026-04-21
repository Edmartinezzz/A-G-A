"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Loader2 } from "lucide-react"

export function SocialAuth() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const loginWithProvider = async (provider: "google" | "github") => {
    try {
      setIsLoading(provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      console.error(error)
    } finally {
      // We don't necessarily reset loading here as we are redirecting
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-full bg-white/5" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 whitespace-nowrap">O por canal externo</span>
        <div className="h-[1px] w-full bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={() => loginWithProvider("google")}
          disabled={!!isLoading}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl h-12 transition-all group"
        >
          {isLoading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-bold uppercase tracking-widest">Google</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => loginWithProvider("github")}
          disabled={!!isLoading}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl h-12 transition-all group"
        >
          {isLoading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-xs font-bold uppercase tracking-widest">GitHub</span>
        </Button>
      </div>
    </div>
  )
}
