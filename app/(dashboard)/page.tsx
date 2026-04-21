"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  Camera, 
  DollarSign, 
  Zap, 
  AlertCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Info,
  ChevronRight,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: analytics, error } = await supabase.rpc('get_user_analytics');
        if (!error) setData(analytics);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [])

  const chartData = data?.monthly_stats?.map((s: any) => ({
    name: new Date(s.month).toLocaleDateString('es-ES', { month: 'short' }),
    total: Number(s.total_cif)
  })).reverse() || []

  const totalImportado = data?.monthly_stats?.reduce((acc: number, s: any) => acc + Number(s.total_cif), 0) || 0;
  const totalImpuestos = data?.monthly_stats?.reduce((acc: number, s: any) => acc + Number(s.total_taxes), 0) || 0;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Premium Hero Banner - Deep Space Aurora */}
      <motion.section 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.2, duration: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#02040a] p-8 md:p-14 text-white shadow-2xl border border-white/[0.05] group"
      >
        {/* Aurora Mesh Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
           <div className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-[#02040a]/5 to-transparent blur-[100px] group-hover:opacity-70 transition-opacity duration-1000 opacity-40 mix-blend-screen" />
           <div className="absolute top-[20%] -right-[30%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-[#02040a]/5 to-transparent blur-[120px] group-hover:translate-x-10 transition-transform duration-[3s] opacity-50 mix-blend-screen" />
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
        
        <div className="relative z-10 max-w-2xl space-y-8">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.1)]"
          >
            <Activity className="h-3.5 w-3.5 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] rounded-full" />
            <span>Sistema A-G-A Core Activado</span>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-5xl md:text-[5rem] font-syne font-bold tracking-tight leading-[0.9] drop-shadow-lg">
              Saludos, <br />
              <span className="aurora-text font-black tracking-tighter">Comandante Ady.</span>
            </h2>
            <p className="text-slate-300 font-pjs text-lg max-w-lg leading-relaxed font-medium">
              El centro neurálgico de tus operaciones internacionales está en línea. Clasificación, impuestos y análisis en un solo lugar.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-emerald-500 hover:bg-emerald-400 text-[#02040a] font-pjs font-bold h-14 rounded-2xl px-10 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] group relative overflow-hidden"
              onClick={() => router.push("/escaner")}
            >
              {/* Light Sweep */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <Camera className="mr-3 h-5 w-5 group-hover:-rotate-12 group-hover:scale-110 transition-transform relative z-10" />
              <span className="relative z-10 tracking-wide uppercase text-sm">Iniciar Escáner IA</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-14 rounded-2xl px-10 transition-all backdrop-blur-md font-pjs font-bold uppercase tracking-wide text-sm hover:border-white/20"
              onClick={() => router.push("/calculadora")}
            >
              Simulador Aduanal
            </Button>
          </div>
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 right-10 opacity-30 pointer-events-none hidden lg:block scale-[1.5] origin-right">
           <BrainCircuit className="h-[400px] w-[400px] text-indigo-400 drop-shadow-[0_0_50px_rgba(99,102,241,0.5)] mix-blend-screen" />
        </div>
      </motion.section>

      {/* KPI Cards Grid - Bento Hub Layout */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Valor Operado", value: `$${totalImportado.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", shadow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]", trend: "+12% este mes" },
          { title: "Margen Ahorro", value: `$${(totalImpuestos * 0.1).toLocaleString()}`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", shadow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]", trend: "Optimizado" },
          { title: "Poder de Cómputo", value: data?.total_queries || "Pro", icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", shadow: "shadow-[0_0_20px_rgba(99,102,241,0.15)]", trend: "Infinito" },
          { title: "Riesgo Aduanal", value: "Bajo", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", shadow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]", trend: "Auditoría OK" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            className="h-full group"
          >
            <div className="glass-premium rounded-[1.5rem] h-full p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              {/* Light Sweep Effect on Hover */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
              
              <div className="flex flex-row items-center justify-between pb-4">
                <span className="text-[11px] font-pjs font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-300 transition-colors">{kpi.title}</span>
                <div className={cn("h-11 w-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 border", kpi.bg, kpi.border, kpi.shadow)}>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
              </div>
              <div className="space-y-2 mt-auto">
                {loading ? (
                  <Loader2 className="h-7 w-7 animate-spin text-slate-600" />
                ) : (
                  <>
                    <div className="text-[2rem] font-syne font-bold tracking-tight text-white drop-shadow-sm">{kpi.value}</div>
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", kpi.color)}>{kpi.trend}</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Analytical Bento Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="xl:col-span-2"
        >
          <div className="glass-premium rounded-[2rem] h-full p-8 flex flex-col">
            <div className="flex flex-row items-start justify-between pb-8">
              <div className="space-y-2">
                <h3 className="text-xl font-syne font-bold text-white">Flujo Financiero</h3>
                <p className="text-xs font-pjs font-bold uppercase tracking-widest text-slate-400">Total CIF Nacionalizado (USD)</p>
              </div>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />}
            </div>
            <div className="h-[350px] w-full mt-auto">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700, fill: '#64748b', fontFamily: 'Plus Jakarta Sans'}} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700, fill: '#64748b', fontFamily: 'Plus Jakarta Sans'}}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#02040a', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                        fontFamily: 'Plus Jakarta Sans'
                      }}
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#818cf8" 
                      strokeWidth={3}
                      fill="url(#colorTotal)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                   <Activity className="h-12 w-12 mb-4 animate-pulse opacity-50" />
                   <p className="text-[10px] font-black uppercase tracking-widest font-pjs">Sin Datos Operativos</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="space-y-5 flex flex-col"
        >
           {/* Insight Bento Card */}
           <div className="glass-premium rounded-[2rem] p-6 text-white overflow-hidden group relative flex-1 flex flex-col justify-center border-indigo-500/20">
              <div className="absolute inset-x-0 -bottom-[50%] h-full bg-indigo-500/20 blur-[50px] mix-blend-screen opacity-50 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <BrainCircuit className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">A-G-A Insight</span>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Optimización Fiscal</p>
                    </div>
                 </div>
                 <p className="text-lg font-syne font-medium leading-snug">
                    Considera reclasificar tus equipos informáticos bajo la partida <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">8471.30</span> para reducir ad-valorem a 0%.
                 </p>
              </div>
           </div>

           {/* Activity Bento Card */}
           <div className="glass-premium rounded-[2rem] p-6 flex-1 flex flex-col">
              <h3 className="text-xs font-pjs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Radar Operativo</h3>
              <div className="space-y-5 flex-1 flex flex-col justify-center">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex items-center gap-4 group cursor-pointer p-3 rounded-2xl hover:bg-white/5 transition-all outline outline-1 outline-transparent hover:outline-white/10">
                      <div className="h-10 w-10 rounded-full bg-[#02040a] flex items-center justify-center shrink-0 border border-white/10 shadow-inner group-hover:border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all">
                         <Zap className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="text-sm font-pjs font-bold text-white truncate">Análisis de Motor DC</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Hace 12 Minutos</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  )
}
