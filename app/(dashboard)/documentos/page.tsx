"use client"

import { useState } from "react"
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  Download, 
  Share2, 
  Search,
  Filter,
  FileCheck,
  FileBarChart,
  History
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const documents = [
  { id: 1, name: "Simulación_Laptops_China.pdf", date: "Hace 2 horas", size: "1.2 MB", type: "simulacion" },
  { id: 2, name: "Factura_Proforma_Zapatos.pdf", date: "Ayer", size: "850 KB", type: "factura" },
  { id: 3, name: "Checklist_Legal_Químicos.pdf", date: "15 Oct 2023", size: "2.4 MB", type: "checklist" },
  { id: 4, name: "Reporte_Anual_Import_2023.pdf", date: "20 Oct 2023", size: "5.1 MB", type: "simulacion" },
  { id: 5, name: "Simulación_Mobiliario_USA.pdf", date: "22 Oct 2023", size: "1.1 MB", type: "simulacion" },
  { id: 6, name: "Factura_001_Suministros.pdf", date: "24 Oct 2023", size: "920 KB", type: "factura" },
]

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "simulacion": return <FileBarChart className="h-10 w-10 text-emerald-500" />;
      case "factura": return <FileText className="h-10 w-10 text-blue-500" />;
      case "checklist": return <FileCheck className="h-10 w-10 text-amber-500" />;
      default: return <FileText className="h-10 w-10 text-slate-400" />;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-syne font-bold tracking-tight text-white drop-shadow-sm">Gestor de Documentos</h2>
          <p className="text-slate-400 text-sm font-pjs font-medium mt-1">Archivador digital de tus operaciones de comercio exterior.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <Input 
              placeholder="Buscar documentos..." 
              className="pl-11 h-12 w-[280px] bg-[#02040a]/50 backdrop-blur-md border-white/10 rounded-2xl text-[13px] text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 hover:bg-[#02040a]/70 transition-all font-pjs shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-[#02040a]/50 hover:bg-[#02040a]/80 text-slate-400 hover:text-white transition-all backdrop-blur-md">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Filtering */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="bg-[#02040a]/50 backdrop-blur-md border border-white/10 p-1.5 rounded-[1.25rem] mb-8 h-12">
          <TabsTrigger value="todos" className="rounded-xl px-6 font-pjs font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-500 transition-all">Todos</TabsTrigger>
          <TabsTrigger value="simulaciones" className="rounded-xl px-6 font-pjs font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-500 transition-all">Simulaciones</TabsTrigger>
          <TabsTrigger value="facturas" className="rounded-xl px-6 font-pjs font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-500 transition-all">Facturas Proforma</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-xl px-6 font-pjs font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 text-slate-500 transition-all">Checklists Legales</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="group glass-premium border-white/10 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-500 overflow-hidden bg-[#02040a]/40">
                <CardContent className="p-6">
                  {/* File Visual */}
                  <div className="relative aspect-square mb-6 bg-[#02040a]/50 border border-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#02040a]/80 transition-colors overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
                    <FileIcon type={doc.type} />
                    <div className="absolute top-3 right-3">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-[#02040a]/80 backdrop-blur-md border border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-white">
                                <MoreVertical className="h-4 w-4" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-[#0f172a] border-white/10 text-white font-pjs rounded-2xl">
                             <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-indigo-500/20 focus:text-white rounded-xl">
                                <Eye className="h-4 w-4" /> Ver Online
                             </DropdownMenuItem>
                             <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-indigo-500/20 focus:text-white rounded-xl">
                                <Download className="h-4 w-4" /> Descargar
                             </DropdownMenuItem>
                             <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-indigo-500/20 focus:text-white rounded-xl">
                                <Share2 className="h-4 w-4" /> Compartir
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 overflow-hidden">
                    <h3 className="text-[13px] font-pjs font-bold text-white truncate pr-4 group-hover:text-indigo-300 transition-colors">{doc.name}</h3>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">
                       <History className="h-3 w-3 text-slate-600" />
                       {doc.date}
                       <span className="mx-1 text-slate-700">•</span>
                       {doc.size}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Los otros contenidos de pestañas se filtrarían igual en una app real */}
      </Tabs>

      {/* Empty State Suggestion */}
      {filteredDocs.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-5">
           <div className="h-24 w-24 rounded-[2rem] bg-[#02040a]/50 border border-white/5 flex items-center justify-center shadow-inner">
              <FileText className="h-10 w-10 text-slate-600" />
           </div>
           <div className="max-w-xs space-y-2">
              <h4 className="text-lg font-syne font-bold text-white">No hay documentos</h4>
              <p className="text-sm font-pjs text-slate-400 leading-relaxed">Intenta ajustar tu búsqueda o crea una nueva simulación para generar un PDF.</p>
           </div>
        </div>
      )}
    </div>
  )
}
