"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Camera, 
  RefreshCw, 
  Zap, 
  Info,
  Maximize2,
  PackageSearch,
  CheckCircle2,
  ChevronUp,
  ImagePlus,
  Paperclip
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export default function EscanerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)

  // Función principal de análisis
  const processAnalysis = async (base64: string) => {
    setIsAnalyzing(true)
    setPreviewImage(base64)
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      
      const res = await response.json();
      
      if (res.success) {
        setResultData(res.data);
        setShowResult(true);
      } else {
        alert("No se pudo identificar el producto. " + (res.error || "Inténtalo de nuevo."));
      }
    } catch (error) {
      console.error("Scan error:", error);
      alert("Error de conexión con el servidor de IA.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Captura simulada (Cámara)
  const handleCapture = async () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
    // Para la demo, usamos una imagen de stock como si fuera la captura
    const mockImage = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1780&auto=format&fit=crop"
    await processAnalysis(mockImage)
  }

  // Carga de archivo real
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      await processAnalysis(base64)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-3xl bg-black border border-slate-800 shadow-2xl">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Simulation Visor (Abstract Background) */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale-[0.5]" />
      
      {/* Glassy Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Focus Box Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-sm aspect-square">
          {/* Corner Borders */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl opacity-80" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl opacity-80" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl opacity-80" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl opacity-80" />
          
          {/* Breathing Animation Focus */}
          <motion.div 
            animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 border border-emerald-500/30 rounded-2xl"
          />

          {/* Laser Scanner Line */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 group overflow-hidden">
               <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Engine</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Modo Simulación Activo</span>
            </div>
         </div>
         <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <Zap className="h-5 w-5" />
         </Button>
      </div>

      {/* UI States */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         <AnimatePresence>
            {isAnalyzing && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 className="bg-black/80 backdrop-blur-xl px-8 py-6 rounded-3xl border border-emerald-500/30 flex flex-col items-center gap-4 text-center z-30"
               >
                  <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-tighter">Analizando Mercancía</p>
                    <p className="text-[10px] text-slate-400">Motor de Visión Computacional Activo</p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-8 z-20">
         <p className="text-white/60 text-[10px] font-bold px-8 text-center max-w-xs uppercase tracking-tighter">
            Apunta la cámara o sube una fotografía para clasificar automáticamente.
         </p>
         
         <div className="flex items-center gap-12">
            <Button 
               variant="ghost" 
               size="icon" 
               className="text-white/40 hover:text-emerald-400 h-12 w-12 hover:bg-emerald-500/10 rounded-full transition-all"
               onClick={triggerFileUpload}
               title="Subir Fotografía"
            >
               <ImagePlus className="h-7 w-7" />
            </Button>
            
            <button 
              onClick={handleCapture}
              disabled={isAnalyzing}
              className="group relative h-20 w-20 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 border-4 border-white/30 rounded-full group-hover:border-emerald-500 group-hover:scale-110 transition-all" />
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                 <Camera className="h-8 w-8 text-black group-hover:text-white" />
              </div>
            </button>

            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white h-12 w-12">
               <Maximize2 className="h-6 w-6" />
            </Button>
         </div>
      </div>

      {/* Flash Effect */}
      <AnimatePresence>
        {flash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Result Drawer */}
      <Sheet open={showResult} onOpenChange={setShowResult}>
        <SheetContent side="bottom" className="rounded-t-[40px] border-none bg-white p-8 h-[70vh] md:h-[60vh] overflow-y-auto">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-emerald-100 p-2 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
               </div>
               <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">Producto Identificado</SheetTitle>
            </div>
            <SheetDescription className="text-slate-500 font-medium">
               El motor de IA ha detectado el siguiente producto con éxito.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
             <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                   <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 p-1.5 overflow-hidden shadow-sm">
                      <img 
                        src={previewImage || ""} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-xl" 
                      />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre Detectado</p>
                       <p className="text-lg font-bold text-slate-900 leading-tight">
                        {resultData?.analisis_visual?.nombre_tecnico || "Analizando..."}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Confianza: 98%</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Arancel Sugerido</p>
                      <p className="text-2xl font-black text-emerald-900 mt-2">
                        {resultData?.analisis_visual?.hs_code_sugerido_6_digitos || "--"}
                      </p>
                   </div>
                   <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Material Principal</p>
                      <p className="text-lg font-black text-blue-900 mt-2 truncate">
                        {resultData?.analisis_visual?.material_principal || "--"}
                      </p>
                   </div>
                </div>
             </div>

             <div className="flex flex-col justify-end gap-3 pb-4">
                <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200/50 mb-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Uso Previsto</p>
                   <p className="text-xs text-slate-600 italic">"{resultData?.analisis_visual?.uso_previsto || "No especificado"}"</p>
                </div>
                <Button className="h-14 bg-[#0F172A] hover:bg-black text-white font-bold rounded-2xl shadow-xl">
                   Abrir Ficha de Arancel
                </Button>
                <Button variant="outline" className="h-14 border-slate-200 rounded-2xl font-bold text-slate-600">
                   Recalcular Costos
                </Button>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
