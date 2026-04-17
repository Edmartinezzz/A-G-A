"use client"

import { useState } from "react"
import { Globe, Package, MapPin, BadgeDollarSign, Truck, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SimulatorPage() {
  const [formData, setFormData] = useState({
    product: "",
    origin: "",
    incoterm: "FOB",
    value: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setReport(null)

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.report) {
        setReport(data.report)
      } else {
        setReport("Hubo un error al generar la simulación.")
      }
    } catch (err) {
      setReport("Error de conexión.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-x-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Globe className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulador de Operaciones</h1>
          <p className="text-muted-foreground">Analiza la viabilidad y riesgos de tu importación usando IA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-x-2">
            Detalles de la Operación
          </h2>
          <form className="space-y-5" onSubmit={handleSimular}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Producto a Importar</label>
              <div className="relative">
                <Package className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  required
                  placeholder="Ej: Servidores informáticos, Tela de algodón..." 
                  className="pl-9"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">País de Origen</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  required
                  placeholder="Ej: China, Estados Unidos, España..." 
                  className="pl-9"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-sm font-medium">Término (Incoterm)</label>
                 <div className="relative">
                   <Truck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                   <select 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9"
                      value={formData.incoterm}
                      onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                   >
                     <option value="EXW">EXW (Ex Works)</option>
                     <option value="FOB">FOB (Free on Board)</option>
                     <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                     <option value="DDP">DDP (Delivered Duty Paid)</option>
                   </select>
                 </div>
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-sm font-medium">Valor Aprox (USD)</label>
                 <div className="relative">
                   <BadgeDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                   <Input 
                     required
                     type="number"
                     placeholder="10000" 
                     className="pl-9"
                     value={formData.value}
                     onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                   />
                 </div>
               </div>
            </div>

            <Button 
               type="submit" 
               className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4" 
               size="lg"
               disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {isLoading ? "Analizando Operación..." : "Generar Reporte de Simulación"}
            </Button>
          </form>
        </div>

        {/* Reporte Outcome */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-x-2">
            Reporte de Viabilidad
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 relative">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                   <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-sm font-medium animate-pulse">A-G-A está consultando la normativa actual...</p>
                </div>
             ) : report ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                   {report}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                   <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                   <p className="text-slate-400 text-sm max-w-[250px]">
                      LLena el formulario para generar un informe aduanal detallado usando nuestra IA experta.
                   </p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
