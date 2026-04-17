"use client"

import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const routeTitles: Record<string, string> = {
  "/dashboard": "Panel de Control",
  "/chat": "Asistente IA",
  "/calculadora": "Calculadora Aduanal",
  "/escaner": "Escáner de Mercancía",
  "/documentos": "Gestor de Documentos",
  "/perfil": "Mi Cuenta",
  "/ajustes": "Configuración",
}

export function Topbar() {
  const pathname = usePathname()
  const title = routeTitles[pathname] || "A-G-A"

  return (
    <header className="h-16 border-b bg-white dark:bg-[#0F172A]/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white md:text-xl">
          {title}
        </h1>
      </div>

      {/* Search Bar - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar operaciones, aranceles..." 
            className="pl-10 bg-slate-100 border-none focus-visible:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-emerald-500 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
        </Button>
        
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
        
        {/* Profile Summary - Compact */}
        <div className="flex items-center gap-3 pl-2">
           <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Admin User</span>
              <span className="text-[10px] text-emerald-600 font-medium">Premium</span>
           </div>
           <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Avatar"
                className="w-full h-full object-cover"
              />
           </div>
        </div>
      </div>
    </header>
  )
}
