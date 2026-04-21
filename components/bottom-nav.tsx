"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Camera, 
  FileSignature,
  Calculator,
  Menu
} from "lucide-react"
import { MobileSidebar } from "@/components/mobile-sidebar"

const routes = [
  {
    label: "Inicio",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Asistente",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    label: "Cálculos",
    icon: Calculator,
    href: "/calculadora",
  },
  {
    label: "Redactor",
    icon: FileSignature,
    href: "/redactor",
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-6 inset-x-4 z-[100] flex justify-center">
      <nav className="glass-premium rounded-full px-6 py-3 flex items-center justify-between w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-x-0 -bottom-10 h-20 bg-indigo-500/20 blur-[40px] pointer-events-none" />

        {routes.map((route) => {
          const isActive = pathname === route.href
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "relative flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-emerald-400" : "text-slate-400 hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive && "bg-emerald-500/10 scale-110"
              )}>
                <route.icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                )} />
              </div>
              <span className="text-[10px] font-bold tracking-tight">{route.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          )
        })}

        {/* More Button using MobileSidebar */}
        <div className="relative flex flex-col items-center gap-1 text-slate-400">
          <MobileSidebar />
          <span className="text-[10px] font-bold tracking-tight">Menú</span>
        </div>
      </nav>
    </div>
  )
}
