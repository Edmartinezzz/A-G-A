"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AGALogo } from "@/components/aga-logo"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calculator, 
  Camera, 
  FileText, 
  FileSignature,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Bell,
  Sparkles
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const countries = [
  { name: "Venezuela", flag: "🇻🇪", code: "VE" },
  { name: "USA", flag: "🇺🇸", code: "US" },
  { name: "China", flag: "🇨🇳", code: "CN" },
]

const mainRoutes = [
  {
    label: "Página Principal",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Panel de Control",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Asistente IA",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    label: "Calculadora",
    icon: Calculator,
    href: "/calculadora",
  },
  {
    label: "Escáner IA",
    icon: Camera,
    href: "/escaner",
  },
  {
    label: "Redactor IA",
    icon: FileSignature,
    href: "/redactor",
  },
  {
    label: "Mis Documentos",
    icon: FileText,
    href: "/documentos",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [selectedCountry, setSelectedCountry] = useState(countries[0])

  return (
    <div className="flex flex-col h-full bg-transparent p-4">
      <div className="glass-premium rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl relative w-full border-r-0">
        {/* Deep Space Glow for sidebar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-emerald-500/10 to-transparent blur-3xl pointer-events-none opacity-60" />

        <div className="p-5 flex flex-col gap-y-8 flex-1 relative z-10 w-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center py-4">
            <Link href="/dashboard" className="transition-transform hover:scale-105 active:scale-95">
              <AGALogo />
            </Link>
          </div>

          {/* Country Selector */}
          <div className="px-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-white/5 border-white/10 text-slate-100 hover:bg-white/10 hover:border-white/20 rounded-2xl h-14 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">{selectedCountry.flag}</span>
                    <span className="text-xs font-semibold tracking-widest uppercase text-white/90 group-hover:text-white transition-colors">{selectedCountry.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px] glass-premium text-slate-100 p-2 rounded-2xl border-white/10">
                <DropdownMenuLabel className="font-syne font-bold uppercase tracking-widest text-[10px] text-emerald-400 px-2 pb-2">Destino Aduanal</DropdownMenuLabel>
                {countries.map((country) => (
                  <DropdownMenuItem 
                    key={country.code} 
                    onClick={() => setSelectedCountry(country)}
                    className="gap-3 focus:bg-white/10 focus:text-white cursor-pointer rounded-xl p-3 transition-colors"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="font-semibold tracking-tight text-sm">{country.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {mainRoutes.map((route) => {
              const isActive = pathname === route.href
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "group relative flex items-center p-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 overflow-hidden",
                    isActive 
                      ? "text-white" 
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-indigo-500/10 rounded-2xl border border-white/10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <div className={cn("relative z-10 flex items-center justify-center p-2 rounded-xl transition-all duration-300", isActive ? "bg-white/10 shadow-inner" : "group-hover:bg-white/5")}>
                     <route.icon className={cn(
                       "h-5 w-5 transition-all text-white",
                       isActive ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
                     )} />
                  </div>
                  <span className={cn("relative z-10 ml-3 tracking-wide transition-all", isActive ? "font-bold text-white drop-shadow-md text-[15px]" : "font-medium")}>{route.label}</span>
                  {isActive && (
                    <Sparkles className="ml-auto h-4 w-4 text-emerald-400 relative z-10 animate-pulse drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Profile Section */}
        <div className="p-5 mt-auto relative z-10 border-t border-white/5 bg-black/20">
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-2 mb-3 shadow-inner">
            <Link 
              href="/perfil" 
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group"
            >
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 p-[2px] shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_20px_rgba(52,211,153,0.6)] transition-shadow duration-500">
                <div className="h-full w-full rounded-full bg-[#02040a] flex items-center justify-center">
                   <User className="h-5 w-5 text-emerald-400 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden justify-center">
                 <span className="text-[13px] font-syne font-bold text-white truncate tracking-wide">Admin P.</span>
                 <span className="text-[10px] aurora-text font-black tracking-widest uppercase">Ultra Partner</span>
              </div>
            </Link>
          </div>
          
          <div className="flex gap-2 px-1">
             <Button variant="ghost" size="icon" className="flex-1 h-11 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">
                <Settings className="h-5 w-5" />
             </Button>
             <Button variant="ghost" size="icon" className="flex-1 h-11 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/15 hover:border-red-500/30 transition-all group">
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
