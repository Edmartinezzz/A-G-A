"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  ExternalLink,
  ShieldAlert,
  Loader2,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function ArancelesAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch logic
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: aranceles, error } = await supabase
        .from('aranceles_maestros')
        .select(`
          *,
          restricciones_legales (
            restriction_type,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(aranceles || []);
    } catch (err) {
      console.error("Error fetching tariffs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  const filteredData = data.filter(item => 
    item.hs_code.includes(searchTerm) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const payload = {
        hs_code: formData.get('hs_code') as string,
        name: formData.get('name') as string,
        standard_arancel: Number(formData.get('arancel')),
        // Nota: En una app real generaríamos el embedding aquí también
      };

      const { error } = await supabase.from('aranceles_maestros').insert(payload);
      if (error) throw error;
      
      await fetchData();
      alert("Registro guardado con éxito.");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error al guardar el arancel.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestor de Aranceles</h2>
          <p className="text-slate-500">Administra la base de datos maestra de códigos HS y regulaciones.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={fetchData}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Sincronizar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Arancel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>Nuevo Código Arancelario</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles técnicos y tributarios para el nuevo registro aduanal.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="hs_code" className="text-right">Código HS</Label>
                    <Input name="hs_code" id="hs_code" placeholder="0000.00.00" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Descripción</Label>
                    <Input name="name" id="name" placeholder="Nombre técnico..." className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="arancel" className="text-right">Arancel %</Label>
                    <Input name="arancel" id="arancel" type="number" placeholder="0" className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Registro"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por código HS o descripción..." 
            className="pl-10 h-10 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[150px] font-bold text-slate-700">Código HS</TableHead>
              <TableHead className="font-bold text-slate-700">Descripción Técnica</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">Arancel %</TableHead>
              <TableHead className="font-bold text-slate-700">Restricciones</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300" />
                </TableCell>
              </TableRow>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono font-medium text-emerald-600">{item.hs_code}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-900">
                      {item.standard_arancel}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.restricciones_legales && item.restricciones_legales.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.restricciones_legales.map((r: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600">
                            <ShieldAlert className="h-3 w-3" />
                            {r.restriction_type}: {r.description}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin restricciones</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                  No se encontraron resultados para tu búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
