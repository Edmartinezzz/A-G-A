"use client"

import { useState, useMemo } from "react"
import { 
  Calculator, 
  Info, 
  Save, 
  FileText, 
  Download,
  ShieldCheck,
  TrendingDown
} from "lucide-react"
import { 
  calcularCostosNacionalizacion, 
  DatosEntradaCalculo, 
  ResultadoCalculoAduanero 
} from "@/lib/aduanas/calculadora"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// Categorías de ejemplo con sus tasas
const categorizaciones = [
  { id: "electronicos", name: "Electrónicos / Computación", arancel: 5, tasa: 1 },
  { id: "textil", name: "Textil / Calzado", arancel: 20, tasa: 1 },
  { id: "maquinaria", name: "Maquinaria Industrial", arancel: 10, tasa: 1 },
  { id: "repuestos", name: "Repuestos Automotrices", arancel: 15, tasa: 1 },
  { id: "exento", name: "Productos Exentos / Médicos", arancel: 0, tasa: 0.5 },
]

export default function CalculadoraPage() {
  // Estado del Formulario
  const [formData, setFormData] = useState({
    valorFOB: 0,
    flete: 0,
    seguro: "" as string | number,
    categoriaId: categorizaciones[0].id,
    tasaIVA: 16
  })

  // Obtener categoría activa
  const categoriaActiva = categorizaciones.find(c => c.id === formData.categoriaId) || categorizaciones[0]

  // Cálculo en tiempo real
  const resultado: ResultadoCalculoAduanero = useMemo(() => {
    const datos: DatosEntradaCalculo = {
      valorFOB: Number(formData.valorFOB) || 0,
      flete: Number(formData.flete) || 0,
      seguro: formData.seguro === "" ? null : Number(formData.seguro),
      tasaArancelaria: categoriaActiva.arancel,
      tasaIVA: Number(formData.tasaIVA) || 0,
      tasaServicioAduanal: categoriaActiva.tasa
    }
    return calcularCostosNacionalizacion(datos)
  }, [formData, categoriaActiva])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Columna Izquierda: Formulario */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2.5 rounded-2xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Calculator className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-syne font-bold text-white tracking-tight drop-shadow-sm">Nueva Simulación</h2>
            <p className="text-slate-400 font-pjs text-sm font-medium">Ingresa los valores de tu importación para el cálculo fiscal.</p>
          </div>
        </div>

        <Card className="glass-premium rounded-[2rem] border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xl font-syne font-bold text-white">Datos de la Mercancía</CardTitle>
            <CardDescription className="text-slate-400 font-pjs">Valores base para la determinación de la base imponible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <Label htmlFor="valorFOB" className="text-[10px] font-pjs font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">Valor comercial (FOB)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <Input 
                    id="valorFOB"
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 pl-8 bg-[#02040a]/50 backdrop-blur-md border border-white/10 rounded-2xl text-[13px] text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 hover:bg-[#02040a]/70 transition-all font-pjs"
                    value={formData.valorFOB || ""}
                    onChange={(e) => setFormData({...formData, valorFOB: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="flete" className="text-[10px] font-pjs font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">Costo de Flete Internacional</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <Input 
                    id="flete"
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 pl-8 bg-[#02040a]/50 backdrop-blur-md border border-white/10 rounded-2xl text-[13px] text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 hover:bg-[#02040a]/70 transition-all font-pjs"
                    value={formData.flete || ""}
                    onChange={(e) => setFormData({...formData, flete: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 group">
                <Label htmlFor="seguro" className="text-[10px] font-pjs font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">Seguro (Opcional)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <Input 
                    id="seguro"
                    type="number" 
                    placeholder="Auto (2%)" 
                    className="h-12 pl-8 bg-[#02040a]/50 backdrop-blur-md border border-white/10 rounded-2xl text-[13px] text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 hover:bg-[#02040a]/70 transition-all font-pjs"
                    value={formData.seguro}
                    onChange={(e) => setFormData({...formData, seguro: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium italic">Si se deja vacío, se aplicará el 2% legal por defecto.</p>
              </div>
              <div className="space-y-2 group">
                <Label className="text-[10px] font-pjs font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">Categoría de Producto</Label>
                <Select 
                  value={formData.categoriaId} 
                  onValueChange={(val) => setFormData({...formData, categoriaId: val})}
                >
                  <SelectTrigger className="h-12 bg-[#02040a]/50 backdrop-blur-md border border-white/10 rounded-2xl text-[13px] text-white focus:ring-1 focus:ring-indigo-500/50 hover:bg-[#02040a]/70 transition-all font-pjs">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-white font-pjs rounded-2xl">
                    {categorizaciones.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="focus:bg-indigo-500/20 focus:text-white cursor-pointer rounded-xl">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <div className="bg-emerald-500/5 rounded-[1.25rem] p-5 border border-emerald-500/20 flex items-start gap-4">
                 <Info className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-sm font-syne font-bold text-emerald-300">Información Arancelaria Aplicada</p>
                    <p className="text-xs text-slate-300 font-pjs leading-relaxed">
                      Este producto tributa un <span className="font-bold text-emerald-400 pb-0.5 border-b border-emerald-500/30">{categoriaActiva.arancel}%</span> de Ad Valorem y una tasa administrativa del <span className="font-bold text-emerald-400">{categoriaActiva.tasa}%</span>.
                    </p>
                 </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-[#02040a]/30 border-t border-white/5 flex justify-between items-center py-5">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Cálculos basados en Arancel de Aduanas 2026
             </p>
             <Button className="bg-indigo-500 hover:bg-indigo-400 text-white font-pjs font-bold rounded-xl gap-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Save className="h-4 w-4" />
                Guardar Simulación
             </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Columna Derecha: Resultado / Factura */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <Card className="glass-premium rounded-[2.5rem] border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Header Factura */}
            <div className="bg-gradient-to-br from-[#02040a] to-indigo-950/30 p-8 border-b border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-1000" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-pjs font-bold uppercase tracking-[0.2em] text-indigo-400">Resumen de Liquidación</h3>
                    <p className="text-[2.5rem] font-syne font-bold tracking-tight text-white">{formatCurrency(resultado.totalAPagarAduana)}</p>
                 </div>
                 <div className="bg-indigo-500/10 px-3 py-1.5 rounded-lg text-[9px] font-bold text-indigo-400 border border-indigo-500/20 tracking-widest uppercase">
                    PRE-PROFORMA
                 </div>
              </div>
              <p className="text-[11px] text-slate-400 font-pjs relative z-10">Total estimado a pagar en aduana (Impuestos + Tasas)</p>
            </div>

            <CardContent className="p-8 space-y-8 bg-[#02040a]/40">
              {/* Desglose CIF */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-pjs font-bold uppercase text-slate-500 tracking-[0.2em]">Base de Cálculo (CIF)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-[13px] font-pjs">
                    <span className="text-slate-400">Valor FOB Mercancía</span>
                    <span className="font-semibold text-white">{formatCurrency(resultado.desglose.fob)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-pjs">
                    <span className="text-slate-400">Flete Internacional</span>
                    <span className="font-semibold text-white">{formatCurrency(resultado.desglose.flete)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-pjs">
                    <span className="text-slate-400">Seguro de Carga</span>
                    <span className="font-semibold text-white">{formatCurrency(resultado.desglose.seguro)}</span>
                  </div>
                  <Separator className="my-4 border-white/10" />
                  <div className="flex justify-between font-syne font-bold text-indigo-300 text-lg">
                    <span>VALOR CIF TOTAL</span>
                    <span>{formatCurrency(resultado.valorCIF)}</span>
                  </div>
                </div>
              </div>

              {/* Liquidación de Impuestos */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-pjs font-bold uppercase text-slate-500 tracking-[0.2em]">Liquidación Tributaria</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-[13px] font-pjs">
                    <span className="text-slate-400">Impuesto Ad Valorem ({resultado.desglose.arancelPorcentaje}%)</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(resultado.impuestoAdValorem)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-pjs">
                    <span className="text-slate-400">Servicio Aduanal ({resultado.desglose.servicioAduanalPorcentaje}%)</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(resultado.tasaAduanera)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-pjs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">IVA Importación ({resultado.desglose.ivaPorcentaje}%)</span>
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <span className="font-semibold text-emerald-400">{formatCurrency(resultado.montoIVA)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="bg-emerald-500/10 rounded-[1.5rem] p-6 border border-emerald-500/20 flex flex-col items-center text-center gap-2 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] leading-none relative z-10">Total Tributos</p>
                   <p className="text-[2.5rem] font-syne font-black text-white tracking-tight drop-shadow-md relative z-10">{formatCurrency(resultado.totalAPagarAduana)}</p>
                   <p className="text-[10px] text-emerald-400/80 font-pjs relative z-10">Equivalente en moneda local a tasa oficial BCV</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-pjs font-bold rounded-xl gap-2 backdrop-blur-sm transition-all hover:border-white/20 h-12">
                  <Download className="h-4 w-4" />
                  Descargar Reporte PDF
                </Button>
                <div className="flex items-center gap-2 justify-center pb-2">
                   <FileText className="h-3 w-3 text-slate-500" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 text-center leading-tight">
                    Documento no vinculante.
                   </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
