"use client"

import { useState, useEffect } from "react"
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
  Info
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

  // Mapeo de datos para el gráfico
  const chartData = data?.monthly_stats?.map((s: any) => ({
    name: new Date(s.month).toLocaleDateString('es-ES', { month: 'short' }),
    total: Number(s.total_cif)
  })).reverse() || []

  // Totales calculados
  const totalImportado = data?.monthly_stats?.reduce((acc: number, s: any) => acc + Number(s.total_cif), 0) || 0;
  const totalImpuestos = data?.monthly_stats?.reduce((acc: number, s: any) => acc + Number(s.total_taxes), 0) || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Bento Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 md:p-12 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
            <Zap className="h-3 w-3" />
            <span>Sistema Inteligente Activo</span>
          </div>
          <h2 className="text-3xl font-black md:text-5xl tracking-tight leading-none">
            Hola, <span className="text-emerald-400">Admin</span>.
            <br />
            Gestionemos tus importaciones.
          </h2>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-emerald-500 hover:bg-emerald-600 text-[#0F172A] font-black h-12 rounded-2xl px-8 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
              onClick={() => router.push("/escaner")}
            >
              <Camera className="mr-2 h-5 w-5" />
              Lanzar Escáner IA
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-700 bg-transparent text-white hover:bg-slate-800 h-12 rounded-2xl px-8 transition-colors"
              onClick={() => router.push("/calculadora")}
            >
              Nueva Simulación
            </Button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute right-[-5%] top-[-10%] opacity-20 pointer-events-none transition-transform hover:rotate-12 duration-1000">
           <BrainCircuit className="h-96 w-96 text-emerald-500" />
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Importado", value: `$${totalImportado.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+0%" },
          { title: "Impuestos Pagados", value: `$${totalImpuestos.toLocaleString()}`, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+0%" },
          { title: "Consultas IA", value: data?.total_queries || "0", icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10", trend: "Sin límites" },
          { title: "Top HS Code", value: data?.top_hs_codes?.[0]?.hs_code || "N/A", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Frecuente" },
        ].map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900/50 hover:shadow-md transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{kpi.title}</span>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", kpi.bg)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              ) : (
                <>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</div>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">{kpi.trend}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Analytical Layout: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Column */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Flujo de Operaciones</CardTitle>
                <CardDescription>Volumen mensual de importaciones nacionalizadas (USD)</CardDescription>
              </div>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </CardHeader>
            <CardContent className="h-[350px] pl-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700}} 
                      stroke="#94A3B8"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700}} 
                      stroke="#94A3B8"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', cursor: 'default' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#10B981" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 grayscale opacity-50">
                   <Clock className="h-12 w-12 mb-4" />
                   <p className="text-sm font-bold">No hay datos históricos para graficar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts Column */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-1">Alertas Regulatorias</h3>
          
          <div className="space-y-4">
             <Alert variant="warning" className="border-none shadow-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-bold text-xs">Aviso SENCAMER</AlertTitle>
                <AlertDescription className="text-xs">
                  El código 8471 requiere renovación de permiso de importación en 15 días.
                </AlertDescription>
             </Alert>

             <Alert className="border-none shadow-sm bg-blue-50 text-blue-700">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="font-bold text-xs uppercase tracking-wider">Nueva Resolución</AlertTitle>
                <AlertDescription className="text-xs">
                  Publicada Gaceta Oficial #42.XXX: Ajuste en tasas administrativas para el sector lujo.
                </AlertDescription>
                <Button variant="link" className="p-0 h-auto text-[10px] text-blue-800 font-bold mt-2">LEER MÁS</Button>
             </Alert>

             <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                <CardHeader className="p-4">
                   <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="h-4 w-4 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">A-G-A Insights</span>
                   </div>
                   <p className="text-xs font-medium leading-relaxed">
                      "Hemos detectado que el 40% de tus importaciones son de China. Podrías optimizar un <span className="text-emerald-400">5% en costos</span> consolidando carga en Miami."
                   </p>
                </CardHeader>
             </Card>
          </div>

          <Card className="border-none shadow-sm">
             <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold">Actividad Reciente</CardTitle>
             </CardHeader>
             <CardContent className="p-4 pt-0 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-slate-400" />
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-900 truncate uppercase">Simulación: Laptops Pro</p>
                        <p className="text-[9px] text-slate-400 uppercase">Hoy — 14:00</p>
                     </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
