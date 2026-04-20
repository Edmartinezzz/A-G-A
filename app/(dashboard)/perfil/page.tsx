"use client"

import { User, Shield, Bell, Settings, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PerfilPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Perfil de Usuario</h2>
        <p className="text-slate-500 font-medium">Gestiona tu información personal y preferencias de seguridad.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-sm h-fit">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Usuario Demo</h3>
            <p className="text-sm text-slate-500">Socio Logístico</p>
            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" /> Configuración
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Información de la Cuenta</CardTitle>
              <CardDescription>Detalles vinculados a tu empresa y operaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <p className="text-sm font-bold text-slate-500">EMAIL</p>
                <p className="text-sm text-slate-900 dark:text-white">demo@aga-intelligent.com</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <p className="text-sm font-bold text-slate-500">EMPRESA</p>
                <p className="text-sm text-slate-900 dark:text-white">Logística Global S.A.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-bold text-slate-500">PLAN</p>
                <div className="flex items-center gap-2">
                  <span className="bg-sky-500/10 text-sky-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">Enterprise</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold">Autenticación de dos pasos</p>
                    <p className="text-xs text-slate-500">Protege tu cuenta con seguridad adicional.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Activar</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-sm font-bold">Notificaciones</p>
                    <p className="text-xs text-slate-500">Recibe alertas sobre cambios en aranceles.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
