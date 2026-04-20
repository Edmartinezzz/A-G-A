import { Package } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 md:p-10 overflow-hidden">
      {/* Background with Image and Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: "url('/assets/login-bg.png')" }}
      />
      <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-[2px] bg-gradient-to-br from-slate-950/80 via-slate-950/20 to-slate-950/80" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-[1400px] grid lg:grid-cols-2 gap-10 items-center">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col gap-8 text-white">
          <Link href="/" className="flex items-center gap-3 font-bold text-3xl group transition-all">
            <div className="bg-sky-500 rounded-2xl p-2 shadow-lg shadow-sky-500/40 group-hover:scale-110 transition-transform">
               <Package className="h-7 w-7 text-white" />
            </div>
            <span className="tracking-tight">A-G-A</span>
          </Link>
          
          <div className="space-y-6 max-w-[550px] animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl font-black tracking-tighter leading-tight">
              Gestión Aduanal <br/>
              <span className="text-sky-400">Inteligente</span> Potenciada por IA
            </h1>
            <p className="text-xl text-slate-200/90 leading-relaxed font-medium">
              La plataforma definitiva para el comercio exterior. Clasificación arancelaria, cálculo de impuestos y asesoría experta en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
               <span className="text-3xl font-black text-sky-400">+150</span>
               <p className="text-sm font-bold text-slate-300 uppercase tracking-widest mt-1">Países Soportados</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
               <span className="text-3xl font-black text-emerald-400">99.9%</span>
               <p className="text-sm font-bold text-slate-300 uppercase tracking-widest mt-1">Precisión en IA</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex flex-col justify-center gap-6 w-full max-w-[480px] mx-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
          Powered by A-G-A Neuronal Engine v2.0 • Security Verified
        </p>
      </div>
    </div>
  );
}
