"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Bell, 
  Search, 
  Settings,
  Globe,
  HelpCircle,
  Menu,
  ChevronRight
} from "lucide-react"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"

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
    <header className="h-[4.5rem] glass-nav sticky top-0 z-[50] flex items-center justify-between px-6 md:px-10 border-b-0 shadow-sm shadow-black/20">
      {/* Mobile Title Area */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
             <span className="text-xs font-black text-indigo-400">A</span>
          </div>
          <h1 className="text-lg md:text-[22px] font-syne font-bold tracking-wide text-white drop-shadow-sm ml-1 md:ml-0">
            {title}
          </h1>
        </div>
      </div>

      {/* Search Command Bar - Ultra Premium */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-auto px-8 relative">
        <div className="absolute inset-x-8 -top-3 -bottom-3 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent blur-md pointer-events-none" />
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10" />
          <input 
            placeholder="Comandos, consultas, o presiona ⌘K..." 
            className="w-full bg-[#02040a]/50 backdrop-blur-md border border-white/[0.08] h-12 pl-12 pr-16 rounded-[1.25rem] text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-pjs shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] hover:bg-[#02040a]/70"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-60">
             <kbd className="bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-white/10">⌘</kbd>
             <kbd className="bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-white/10">K</kbd>
          </div>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 relative z-10">
        {/* Connection Status Badge */}
        <div className="hidden xl:flex items-center gap-x-2 mr-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.1)]">
           <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
           <span>En Línea</span>
        </div>

        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all h-11 w-11 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
        </Button>
        
        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />
        
        {/* Profile Component - Premium styled */}
        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
           <div className="hidden sm:flex flex-col text-right">
              <span className="text-[12px] font-syne font-bold text-slate-100 tracking-wide group-hover:text-indigo-400 transition-colors cursor-pointer">Admin P.</span>
              <span className="text-[9px] text-slate-400 font-bold tracking-[0.15em] uppercase">Control M.</span>
           </div>
           <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-[2px] shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
              <div className="h-full w-full rounded-full overflow-hidden bg-[#02040a] border border-[#02040a]">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=02040a" 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
           </div>
        </div>
      </div>
    </header>
  )
}
