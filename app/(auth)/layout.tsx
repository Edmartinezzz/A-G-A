import { Package, Globe, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AGALogo } from "@/components/aga-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 md:p-10 overflow-hidden bg-[#02040a]">
      {/* Immersive Cyber-Glass Background - Aurora Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-[#02040a]/5 to-transparent blur-[120px] rounded-full animate-[pulse_8s_ease-in-out_infinite] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-[#02040a]/5 to-transparent blur-[120px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-gradient-to-tr from-[#02040a] via-transparent to-[#02040a]/50" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-[1400px] grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Premium Branding & Vision */}
        <div className="hidden lg:flex flex-col gap-10 text-white pl-8">
          <Link href="/" className="flex items-center gap-4 group transition-all w-fit">
            <AGALogo />
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <span className="text-[10px] font-pjs font-bold uppercase tracking-[0.4em] text-indigo-400/80">Intelligence</span>
          </Link>
          
          <div className="space-y-8 max-w-[600px] animate-in fade-in slide-in-from-left-12 duration-1000">
            <h1 className="text-[5rem] md:text-[6rem] font-syne font-bold tracking-tight leading-[0.85] drop-shadow-xl">
              Futuro <br/>
              <span className="aurora-text font-black tracking-tighter">Aduanal.</span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed font-pjs font-medium max-w-md">
              Domina el comercio exterior con potencia neuronal. Clasificación de precisión, cálculo dinámico y seguridad absoluta.
            </p>
          </div>

          <div className="flex gap-10 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex items-center gap-5 group cursor-default">
               <div className="h-16 w-16 rounded-[1.5rem] glass-premium flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Globe className="h-7 w-7 text-emerald-400 group-hover:text-indigo-400 transition-colors" />
               </div>
               <div>
                  <p className="text-3xl font-syne font-bold text-white tracking-tight">150+</p>
                  <p className="text-[11px] font-pjs font-bold uppercase tracking-[0.2em] text-slate-500">Naciones</p>
               </div>
            </div>
            
            <div className="flex items-center gap-5 group cursor-default">
               <div className="h-16 w-16 rounded-[1.5rem] glass-premium flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                  <ShieldCheck className="h-7 w-7 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
               </div>
               <div>
                  <p className="text-3xl font-syne font-bold text-white tracking-tight">99.9%</p>
                  <p className="text-[11px] font-pjs font-bold uppercase tracking-[0.2em] text-slate-500">Exactitud</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form with Glassmorphism */}
        <div className="flex flex-col justify-center gap-6 w-full max-w-[480px] mx-auto animate-in fade-in zoom-in-95 duration-700">
          <div className="glass-premium p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
            {/* Ambient terminal glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors duration-1000" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Meta */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-2.5 rounded-full backdrop-blur-xl shadow-lg">
           <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
           <p className="text-[10px] font-pjs font-bold text-slate-400 uppercase tracking-[0.25em]">
             A-G-A Advanced Vision Engine • v4.0.0 • Ultra Certified
           </p>
        </div>
      </div>
    </div>
  );
}
