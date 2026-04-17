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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Formulario */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Calculator className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva Simulación</h2>
            <p className="text-slate-500 text-sm">Ingresa los valores de tu importación para el cálculo fiscal.</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Datos de la Mercancía</CardTitle>
            <CardDescription>Valores base para la determinación de la base imponible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorFOB">Valor comercial (FOB)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <Input 
                    id="valorFOB"
                    type="number" 
                    placeholder="0.00" 
                    className="pl-7"
                    value={formData.valorFOB || ""}
                    onChange={(e) => setFormData({...formData, valorFOB: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flete">Costo de Flete Internacional</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <Input 
                    id="flete"
                    type="number" 
                    placeholder="0.00" 
                    className="pl-7"
                    value={formData.flete || ""}
                    onChange={(e) => setFormData({...formData, flete: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seguro">Seguro (Opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <Input 
                    id="seguro"
                    type="number" 
                    placeholder="Auto (2%)" 
                    className="pl-7"
                    value={formData.seguro}
                    onChange={(e) => setFormData({...formData, seguro: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Si se deja vacío, se aplicará el 2% legal por defecto.</p>
              </div>
              <div className="space-y-2">
                <Label>Categoría de Producto</Label>
                <Select 
                  value={formData.categoriaId} 
                  onValueChange={(val) => setFormData({...formData, categoriaId: val})}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorizaciones.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                 <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                 <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Información Arancelaria Aplicada</p>
                    <p className="text-xs text-slate-500">
                      Este producto tributa un <span className="font-bold text-emerald-600 pb-0.5 border-b border-emerald-500/30">{categoriaActiva.arancel}%</span> de Ad Valorem y una tasa administrativa del <span className="font-bold text-emerald-600">{categoriaActiva.tasa}%</span>.
                    </p>
                 </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t flex justify-between items-center py-4">
             <p className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Cálculos basados en Arancel de Aduanas 2026
             </p>
             <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                <Save className="h-4 w-4" />
                Guardar Simulación
             </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Columna Derecha: Resultado / Factura */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <div className="bg-[#0F172A] p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                 <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Resumen de Liquidación</h3>
                    <p className="text-2xl font-bold">{formatCurrency(resultado.totalAPagarAduana)}</p>
                 </div>
                 <div className="bg-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                    PRE-PROFORMA
                 </div>
              </div>
              <p className="text-[10px] text-slate-400">Total estimado a pagar en aduana (Impuestos + Tasas)</p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Desglose CIF */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Base de Cálculo (CIF)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Valor FOB Mercancía</span>
                    <span className="font-medium text-slate-900">{formatCurrency(resultado.desglose.fob)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Flete Internacional</span>
                    <span className="font-medium text-slate-900">{formatCurrency(resultado.desglose.flete)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Seguro de Carga</span>
                    <span className="font-medium text-slate-900">{formatCurrency(resultado.desglose.seguro)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>VALOR CIF TOTAL</span>
                    <span>{formatCurrency(resultado.valorCIF)}</span>
                  </div>
                </div>
              </div>

              {/* Liquidación de Impuestos */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Liquidación Tributaria</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Impuesto Ad Valorem ({resultado.desglose.arancelPorcentaje}%)</span>
                    <span className="font-medium text-slate-900">{formatCurrency(resultado.impuestoAdValorem)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Servicio Aduanal ({resultado.desglose.servicioAduanalPorcentaje}%)</span>
                    <span className="font-medium text-slate-900">{formatCurrency(resultado.tasaAduanera)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">IVA Importación ({resultado.desglose.ivaPorcentaje}%)</span>
                      <TrendingDown className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span className="font-medium text-slate-900">{formatCurrency(resultado.montoIVA)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex flex-col items-center text-center gap-2">
                   <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest leading-none">Total Tributos</p>
                   <p className="text-4xl font-black text-emerald-900 tracking-tight">{formatCurrency(resultado.totalAPagarAduana)}</p>
                   <p className="text-[10px] text-emerald-600/70 font-medium">Equivalente en moneda local a tasa oficial BCV</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Reporte PDF
                </Button>
                <div className="flex items-center gap-2 justify-center pb-2">
                   <FileText className="h-3 w-3 text-slate-300" />
                   <span className="text-[9px] text-slate-400 text-center leading-tight">
                    Documento informativo no vinculante para declaración aduanera definitiva.
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
