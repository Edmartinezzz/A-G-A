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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs uppercase text-muted-foreground whitespace-nowrap">O continuar con</span>
        <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={() => loginWithProvider("google")}
          disabled={!!isLoading}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isLoading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button 
          variant="outline" 
          onClick={() => loginWithProvider("github")}
          disabled={!!isLoading}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {isLoading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  )
}
