"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AGALogo } from "@/components/aga-logo"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calculator, 
  Camera, 
  FileText, 
  ChevronDown,
  LogOut,
  User,
  Settings,
  Bell
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
    label: "Mis Documentos",
    icon: FileText,
    href: "/documentos",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [selectedCountry, setSelectedCountry] = useState(countries[0])

  return (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 border-r border-slate-800">
      <div className="p-6 flex flex-col gap-y-8 flex-1">
        {/* Logo Section */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <AGALogo />
          </Link>
        </div>

        {/* Country Selector */}
        <div className="px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium">{selectedCountry.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] bg-slate-900 border-slate-700 text-slate-200">
              <DropdownMenuLabel>Seleccionar País</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              {countries.map((country) => (
                <DropdownMenuItem 
                  key={country.code} 
                  onClick={() => setSelectedCountry(country)}
                  className="gap-2 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer"
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {mainRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200",
                pathname === route.href 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <route.icon className={cn(
                "h-5 w-5 mr-3 transition-colors",
                pathname === route.href ? "text-emerald-400" : "group-hover:text-white"
              )} />
              {route.label}
              {pathname === route.href && (
                <div className="ml-auto w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-2 py-4">
           <Link 
            href="/perfil" 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <User className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
               <span className="text-sm font-semibold text-white truncate">Usuario Demo</span>
               <span className="text-xs text-slate-500 truncate">Socio Logístico</span>
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800">
              <Settings className="h-4 w-4 mr-2" />
              Ajustes
           </Button>
           <Button variant="ghost" size="sm" className="text-slate-400 hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
           </Button>
        </div>
      </div>
    </div>
  )
}
