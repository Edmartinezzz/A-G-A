"use client"

import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function MobileSidebar() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-[#0F172A] border-none">
        <div className="sr-only">
          <h2>Menú de Navegación</h2>
        </div>
        <Sidebar aria-label="Navegación Móvil" />
      </SheetContent>
    </Sheet>
  )
}
