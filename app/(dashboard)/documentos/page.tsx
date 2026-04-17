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
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestor de Documentos</h2>
          <p className="text-slate-500 text-sm font-medium">Archivador digital de tus operaciones de comercio exterior.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar documentos..." 
              className="pl-10 h-10 w-[240px] bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Filtering */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="todos" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider">Todos</TabsTrigger>
          <TabsTrigger value="simulaciones" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider">Simulaciones</TabsTrigger>
          <TabsTrigger value="facturas" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider">Facturas Proforma</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-lg px-6 font-bold text-xs uppercase tracking-wider">Checklists Legales</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  {/* File Visual */}
                  <div className="relative aspect-square mb-6 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                    <FileIcon type={doc.type} />
                    <div className="absolute top-3 right-3">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                             <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" /> Ver Online
                             </DropdownMenuItem>
                             <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Download className="h-4 w-4" /> Descargar
                             </DropdownMenuItem>
                             <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Share2 className="h-4 w-4" /> Compartir
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-900 truncate pr-4">{doc.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                       <History className="h-3 w-3" />
                       {doc.date}
                       <span className="mx-1">•</span>
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
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
           <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
              <FileText className="h-10 w-10 text-slate-300" />
           </div>
           <div className="max-w-xs space-y-2">
              <h4 className="text-lg font-bold text-slate-900">No hay documentos</h4>
              <p className="text-sm text-slate-500">Intenta ajustar tu búsqueda o crea una nueva simulación para generar un PDF.</p>
           </div>
        </div>
      )}
    </div>
  )
}
