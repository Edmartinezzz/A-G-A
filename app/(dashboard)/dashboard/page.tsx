import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Clock, 
  AlertCircle,
  FileCheck,
  Ship,
  Plane
} from "lucide-react"

export default function BusinessDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Empresarial</h1>
          <p className="text-muted-foreground mt-1">Resumen general de tus operaciones logísticas y aduaneras.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-x-2">
           <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Estado Global: Operativo
        </div>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Importaciones Activas"
          value="4"
          sub="3 Marítimas, 1 Aérea"
          icon={Package}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <KPICard 
          title="Costo Total Mensual"
          value="$45,200"
          sub="+12.5% vs Mes Anterior"
          icon={TrendingUp}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <KPICard 
          title="Alertas Aduaneras"
          value="1"
          sub="Revisión de permiso INSAI"
          icon={AlertCircle}
          color="text-orange-500"
          bg="bg-orange-500/10"
        />
        <KPICard 
          title="Documentos Listos"
          value="12"
          sub="En los últimos 30 días"
          icon={FileCheck}
          color="text-violet-500"
          bg="bg-violet-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
         {/* Gráfico Simulado */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold flex items-center gap-x-2 mb-8">
               <BarChart3 className="h-5 w-5 text-slate-500" /> Historial de Costos (CIF + Impuestos)
            </h3>
            
            <div className="flex items-end gap-x-4 h-64 mt-4 px-2">
               {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col justify-end group">
                    <div 
                      className="bg-blue-500/80 group-hover:bg-blue-500 transition-all rounded-t-sm w-full relative" 
                      style={{ height: `${h}%` }}
                    >
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded font-medium transition-opacity">
                          ${h}k
                       </div>
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-2">Mes {i+1}</p>
                 </div>
               ))}
            </div>
         </div>

         {/* Línea de Tiempo de Operaciones */}
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold flex items-center gap-x-2 mb-6">
               <Clock className="h-5 w-5 text-slate-500" /> Estado en Tránsito
            </h3>
            
            <div className="flex-1 space-y-6 relative">
               <div className="absolute left-4 top-2 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800" />
               
               <TimelineItem 
                 icon={Ship} 
                 title="Carga desde Ningbo (China)"
                 subtitle="Estimado ETA: 12 Mayo"
                 status="En tránsito marítimo"
                 color="text-blue-500 bg-blue-50 dark:bg-blue-900/30"
               />
               <TimelineItem 
                 icon={Plane} 
                 title="Muestras Médicas (Miami)"
                 subtitle="ETA: MAÑANA"
                 status="Aduana La Guaira"
                 color="text-orange-500 bg-orange-50 dark:bg-orange-900/30"
                 alert
               />
               <TimelineItem 
                 icon={Package} 
                 title="Repuestos Automotrices"
                 subtitle="Entregado 05 Abril"
                 status="Nacionalizado"
                 color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
               />
            </div>
         </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition cursor-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{value}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{sub}</p>
      </div>
    </div>
  )
}

function TimelineItem({ icon: Icon, title, subtitle, status, color, alert }: any) {
   return (
      <div className="flex gap-x-4 relative z-10">
         <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 ${color}`}>
            <Icon className="h-4 w-4" />
         </div>
         <div className="flex-1 mt-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
            <p className="text-xs text-slate-500">{subtitle}</p>
            <div className={`mt-2 text-xs font-medium inline-block px-2 py-0.5 rounded-full ${alert ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
               {status}
            </div>
         </div>
      </div>
   )
}
