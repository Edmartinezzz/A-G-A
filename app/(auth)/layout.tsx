import { Package } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      <div className="w-full max-w-[1400px] grid lg:grid-cols-2 gap-10 items-center">
        <div className="hidden lg:flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <div className="bg-sky-500 rounded-lg p-1">
               <Package className="h-6 w-6 text-white" />
            </div>
            <span>A-G-A</span>
          </Link>
          <div className="space-y-4 max-w-[500px]">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gestión Aduanal Inteligente Potenciada por IA
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              La plataforma definitiva para el comercio exterior. Clasificación arancelaria, cálculo de impuestos y asesoría experta en un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
               <span className="text-2xl font-bold text-sky-500">+150</span>
               <p className="text-sm text-muted-foreground">Países Soportados</p>
            </div>
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
               <span className="text-2xl font-bold text-emerald-500">99.9%</span>
               <p className="text-sm text-muted-foreground">Precisión en Clasificación</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-6 w-full max-w-[450px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
