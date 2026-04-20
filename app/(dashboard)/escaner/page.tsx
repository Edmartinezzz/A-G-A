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
  Paperclip,
  Brain,
  Globe,
  DollarSign,
  ShieldCheck,
  Clock
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSecure, setIsSecure] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  
  // Inicializar cámara si es posible
  useEffect(() => {
    setIsSecure(window.isSecureContext)
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      if (!window.isSecureContext) {
        setCameraError("La cámara requiere una conexión segura (HTTPS).")
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        })
        
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          const playVideo = async () => {
            try {
              await videoRef.current?.play()
              setHasCamera(true)
              setCameraError(null)
            } catch (e) {
              console.error("Autoplay failed:", e)
              setCameraError("Toca para activar la cámara manualmente.")
            }
          }
          videoRef.current.onloadedmetadata = playVideo
        }
      } catch (err: any) {
        console.warn("Cámara no disponible:", err)
        setHasCamera(false)
        setCameraError(err.name === 'NotAllowedError' ? "Permiso denegado. Actívalo en ajustes." : err.message)
      }
    }
    
    startCamera()
    
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Forzar inicio manual
  const forceManualStart = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play()
        setHasCamera(true)
        setCameraError(null)
      } catch (e) {
        setCameraError("No se pudo iniciar. Recarga la página.")
      }
    }
  }

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
        alert("No se pudo identificar el producto: " + (res.error || "Inténtalo de nuevo."));
      }
    } catch (error) {
      console.error("Scan error:", error);
      alert("Error de conexión con el motor de Visión AI.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Captura real desde el video
  const handleCapture = () => {
    if (!hasCamera) {
      forceManualStart()
      return
    }
    
    setFlash(true)
    setTimeout(() => setFlash(false), 150)

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        processAnalysis(base64)
      }
    }
  }

  // Carga de archivo
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
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Visor */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`absolute inset-0 h-full w-full object-cover z-0 transition-opacity duration-500 ${hasCamera ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Fallback & Error UI */}
      {!hasCamera && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-500 gap-4 px-6 text-center z-10">
           {!isSecure && (
              <div className="mb-4 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
                <Info className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-white font-bold">¡CONEXIÓN NO SEGURA!</p>
                <p className="text-[10px] opacity-70">La cámara solo funciona en sitios HTTPS. Usa tu URL de Vercel.</p>
              </div>
           )}
           
           {cameraError && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
               className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex flex-col items-center gap-3"
             >
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin-slow" />
                </div>
                <p className="text-xs text-white font-medium">{cameraError}</p>
                <Button variant="outline" size="sm" onClick={forceManualStart} className="bg-emerald-500 border-none text-black font-bold h-9 px-6 rounded-full hover:bg-emerald-400 mt-2">
                   Activar Cámara
                </Button>
             </motion.div>
           )}
           
           {!cameraError && isSecure && <RefreshCw className="h-8 w-8 animate-spin opacity-20" />}
           
           <Camera className="h-12 w-12 opacity-10" />
           <p className="text-xs font-bold uppercase tracking-widest opacity-30">Hardware Visor Link</p>
        </div>
      )}
      
      {/* Visual Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Camera Reticle */}
      <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
        <div className="relative w-full max-w-sm aspect-square">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl opacity-80" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl opacity-80" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl opacity-80" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl opacity-80" />
          <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border border-white/10 rounded-3xl" />
          
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

      {/* Indicators */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
         <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
               <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
               <span className="text-[10px] font-black text-white uppercase">Vision Pro</span>
            </div>
            {hasCamera && (
              <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Hardware Link</span>
              </div>
            )}
         </div>
         <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <Zap className="h-5 w-5" />
         </Button>
      </div>

      {/* Analyzing Banner */}
      <AnimatePresence>
         {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-black/80 backdrop-blur-xl px-10 py-8 rounded-[40px] border border-emerald-500/30 flex flex-col items-center gap-5 text-center"
                >
                  <RefreshCw className="h-12 w-12 text-emerald-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-lg font-black text-white uppercase tracking-tighter">Procesando</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Sincronizando Cerebros</p>
                  </div>
                </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Control Bar */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-12 z-20">
          <Button onClick={triggerFileUpload} variant="ghost" className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20">
            <ImagePlus className="h-6 w-6" />
          </Button>

          <button 
            onClick={handleCapture}
            className="group relative h-24 w-24 flex items-center justify-center transition-transform active:scale-95"
          >
            <div className="absolute inset-0 border-4 border-white/20 rounded-full group-hover:border-emerald-500 transition-all" />
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-all shadow-2xl">
              <Camera className="h-10 w-10 text-black group-hover:text-white" />
            </div>
          </button>

          <Button variant="ghost" className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-white">
            <Maximize2 className="h-6 w-6" />
          </Button>
      </div>

      {/* Flash Effect */}
      <AnimatePresence>{flash && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-50 pointer-events-none" />}</AnimatePresence>

      {/* Result UI */}
      <Sheet open={showResult} onOpenChange={setShowResult}>
        <SheetContent side="bottom" className="rounded-t-[40px] border-none bg-slate-50 p-0 h-[85vh] overflow-hidden flex flex-col">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-4" />
          
          <div className="flex-1 overflow-y-auto px-6 pb-12">
            <header className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Verificado</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold">{resultData?.timing}ms</span>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 leading-none">Resultado del Análisis</h2>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
                  <Brain className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{resultData?.cerebro_activo}</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Info */}
              <section className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm flex items-center gap-6">
                  <div className="h-28 w-28 rounded-2xl border border-slate-100 p-1 bg-slate-50 shadow-inner overflow-hidden">
                    <img src={previewImage || ""} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Item Identificado</p>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{resultData?.analisis_visual?.nombre_tecnico}</h3>
                    <div className="flex flex-wrap gap-2">
                       <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                        {resultData?.analisis_visual?.material_principal}
                       </span>
                       <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full">
                        Partida Sug.: {resultData?.analisis_visual?.hs_code_sugerido_6_digitos}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-600 p-6 rounded-[32px] text-white">
                    <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest mb-2">Arancel Aplicado</p>
                    <p className="text-4xl font-black">{resultData?.calculo_estimado?.tasaArancelaria}%</p>
                    <p className="text-[10px] text-emerald-100 mt-2 opacity-80">Basado en Base de Datos Principal</p>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <Globe className="h-4 w-4" />
                      <p className="text-[11px] font-bold uppercase tracking-widest">Hallazgo Web</p>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic line-clamp-3">
                      "{resultData?.web_discovery}"
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Desglose de Nacionalización</p>
                    <DollarSign className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Tasa CIF (FOB + Flete/Seguro)</span>
                      <span className="text-slate-900 font-bold">${resultData?.calculo_estimado?.baseImponibleArancel.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Derechos Arancelarios</span>
                      <span className="text-slate-900 font-bold">${resultData?.calculo_estimado?.montoArancel.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">IVA ({resultData?.calculo_estimado?.montoIVA > 0 ? "16%" : "0%"})</span>
                      <span className="text-slate-900 font-bold">${resultData?.calculo_estimado?.montoIVA.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-slate-900 font-black text-lg">Total Nacionalizado</span>
                       <span className="text-emerald-600 font-black text-2xl">${resultData?.calculo_estimado?.totalImporte.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sidebar Info */}
              <aside className="space-y-6">
                <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
                   <div className="relative z-10">
                      <ShieldCheck className="h-8 w-8 text-emerald-400 mb-4" />
                      <h4 className="font-bold text-lg mb-2">Restricciones</h4>
                      {resultData?.database_match?.restricciones && resultData.database_match.restricciones.length > 0 ? (
                        <ul className="space-y-2">
                          {resultData.database_match.restricciones.map((r: any, idx: number) => (
                            <li key={idx} className="text-[10px] leading-tight text-slate-400 border-l border-emerald-400/30 pl-3">
                              <span className="text-emerald-400 font-bold block mb-0.5">{r.tipo}</span>
                              {r.descripcion}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400">No se detectaron restricciones legales inmediatas para este HS Code.</p>
                      )}
                   </div>
                   <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-white/5 rotate-12" />
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg flex items-center gap-3">
                    <PackageSearch className="h-5 w-5" />
                    Asignar Partida
                  </Button>
                  <Button variant="outline" onClick={() => setShowResult(false)} className="w-full h-14 border-slate-200 rounded-2xl font-bold text-slate-600">
                    Nuevo Escaneo
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
