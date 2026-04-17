"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { 
  Send, 
  Mic, 
  Paperclip, 
  MoreHorizontal,
  Info,
  ShieldCheck,
  ExternalLink,
  Search
} from "lucide-react"
import { AGALogo } from "@/components/aga-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (err) => {
      console.error("Chat Error:", err);
      alert("Error al conectar con A-G-A: " + err.message);
    }
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Componente para respuestas enriquecidas (Tarjetas de Arancel)
  const RichResponseCard = ({ data }: { data: any }) => (
    <Card className="mt-3 border-emerald-500/20 bg-emerald-500/5 shadow-none overflow-hidden max-w-sm">
      <div className="bg-emerald-500/10 px-3 py-1.5 flex justify-between items-center border-b border-emerald-500/10">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Dato Arancelario Encontrado</span>
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
           <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Código HS</p>
              <p className="text-sm font-mono font-black text-slate-900">{data.hs_code || "8471.30.00"}</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Arancel</p>
              <p className="text-lg font-black text-emerald-600">{data.tasa || "0%"}</p>
           </div>
        </div>
        <div className="p-2 bg-white/50 rounded flex items-center justify-between group cursor-pointer hover:bg-white transition-colors">
          <span className="text-xs text-slate-600 truncate mr-2">{data.descripcion || "Portátiles y Laptops"}</span>
          <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-500" />
        </div>
      </CardContent>
    </Card>
  )

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.alert("Enviando mensaje: " + input);
    console.log("Chat Submitting:", input);
    if (!input || isLoading) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto rounded-3xl overflow-hidden bg-white dark:bg-[#0F172A]/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-2xl relative">
      
      {/* Search/Header Info */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <AGALogo iconOnly className="scale-75" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">A-G-A Expert</h2>
            <div className="flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Neuronal Engine v3.0 [ACTIVO]</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-500">
              <Search className="h-4 w-4" />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-400">
              <MoreHorizontal className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Message Area */}
      <ScrollArea 
        viewportRef={scrollRef}
        className="flex-1 p-6"
      >
        <div className="space-y-8 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4">
               <AGALogo iconOnly className="opacity-20 grayscale scale-[2]" />
               <div className="max-w-xs space-y-2">
                  <p className="text-sm font-bold text-slate-400">Inicia una consulta técnica</p>
                  <p className="text-xs text-slate-400 italic font-medium">"¿Cuál es el arancel para partes de computadoras?"</p>
               </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m: any) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-3",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                  m.role === "user" 
                    ? "bg-emerald-500 border-emerald-400" 
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}>
                  {m.role === "user" ? (
                    <span className="text-[10px] font-bold text-white">ME</span>
                  ) : (
                    <AGALogo iconOnly className="scale-50" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  "flex flex-col group max-w-[80%]",
                  m.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === "user" 
                      ? "bg-emerald-600 text-white rounded-tr-none font-medium" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800"
                  )}>
                    {m.content}
                    
                    {/* Simular detección de datos enriquecidos si el contenido tiene aranceles */}
                    {m.role === "assistant" && (m.content.includes("%") || m.content.includes("HS")) && (
                      <RichResponseCard data={{ 
                        hs_code: (m.content.match(/\d{4}\.\d{2}\.\d{2}/) || ["8471.30.00"])[0],
                        tasa: (m.content.match(/\d+%/) || ["20%"])[0],
                        descripcion: "Producto detectado en consulta"
                      }} />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-widest pt-1 px-1">
                    {m.role === "user" ? "Enviado — 12:45" : "A-G-A Expert — Sync"}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                  <AGALogo iconOnly className="scale-50 animate-pulse" />
               </div>
               <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
               </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Section */}
      <div className="p-6 border-t bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
        <form 
          onSubmit={handleChatSubmit}
          className="relative group"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-500 rounded-full">
                <Paperclip className="h-4 w-4" />
             </Button>
          </div>
          
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu consulta aduanal aquí..."
            className="w-full h-14 pl-14 pr-24 bg-white dark:bg-slate-800 border-none shadow-xl rounded-full focus-visible:ring-2 focus-visible:ring-emerald-500/50 text-sm font-medium"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 pb-0.5">
             <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-emerald-500 rounded-full">
                <Mic className="h-5 w-5" />
             </Button>
             <Button 
                type="submit" 
                disabled={!input || isLoading} 
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300",
                  !input ? "bg-slate-200 dark:bg-slate-700 text-slate-400" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                )}
             >
                <Send className="h-5 w-5 ml-0.5" />
             </Button>
          </div>
        </form>
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <Info className="h-3 w-3" />
           A-G-A puede generar respuestas incorrectas. Revisa la normativa oficial.
        </div>
      </div>
    </div>
  )
}
