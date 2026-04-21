"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { 
  FileSignature, 
  Send, 
  Upload, 
  Download, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RedactorPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState("")
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/doc-writer" }),
    onError: (err) => {
      console.error("RED-IA ERROR:", err);
    },
    onFinish: () => {
      console.info("RED-IA: Documento generado exitosamente.");
    }
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Obtener solo el contenido emitido por la IA para pintar la hoja
  const aiMessages = messages.filter((m: any) => m.role === "assistant")
  
  const getMessageContent = (m: any) => {
    return m.content || (m.parts && m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')) || '';
  }

  const latestDocumentText = aiMessages.length > 0 ? getMessageContent(aiMessages[aiMessages.length - 1]) : null

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const exportToPDF = async () => {
    if (!documentRef.current || !latestDocumentText) return
    setIsExporting(true)

    try {
      // Capturar el contenedor visual del documento
      const canvas = await html2canvas(documentRef.current, {
        scale: 3, // Alta resolución para PDF nítido
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 612, // Forzar ancho de papel carta para el render
        onclone: (documentoClonado) => {
          const style = documentoClonado.createElement('style');
          style.innerHTML = `
            #document-canvas-area {
              background-color: #ffffff !important;
              padding: 48px !important; /* 12 * 4px = p-12 */
              width: 612px !important;
              margin: 0 !important;
            }
            #document-canvas-area, #document-canvas-area * {
              color: #0f172a !important;
              border-color: #cbd5e1 !important; /* slate-300 para bordes de tablas */
              box-shadow: none !important;
              background-image: none !important;
            }
            /* Asegurar que las tablas de Markdown tengan bordes visibles en el PDF */
            table {
              border-collapse: collapse !important;
              width: 100% !important;
              margin-bottom: 1rem !important;
            }
            th, td {
              border: 1px solid #cbd5e1 !important;
              padding: 8px !important;
              text-align: left !important;
            }
            th {
              background-color: #f8fafc !important;
            }
          `;
          documentoClonado.head.appendChild(style);
        }
      })

      const imgData = canvas.toDataURL("image/png")
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth() // 612pt
      const totalPdfHeight = (canvas.height * pdfWidth) / canvas.width
      const pageHeight = pdf.internal.pageSize.getHeight() // 792pt
      
      let heightLeft = totalPdfHeight
      let position = 0

      // Primera página
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST')
      heightLeft -= pageHeight

      // Páginas adicionales si el documento es largo
      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST')
        heightLeft -= pageHeight
      }

      pdf.save("documento_oficial_aga.pdf")
      
    } catch (error) {
      console.error("Error al exportar PDF:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 lg:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-syne font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
            <FileSignature className="h-8 w-8 text-indigo-400" />
            Redactor IA
          </h2>
          <p className="text-slate-400 text-sm font-pjs font-medium mt-1">
            Generación inteligente de documentos institucionales y mandatos aduaneros.
          </p>
        </div>
      </div>

      <div className="lg:h-full pb-8">
        <Tabs defaultValue="redactor" className="w-full lg:hidden lg:h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-white/10 rounded-xl mb-4">
            <TabsTrigger value="redactor" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg transition-all">Redactor</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg transition-all">Vista Previa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="redactor" className="flex-1 flex flex-col gap-6 outline-none">
             {renderInputColumn()}
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 flex flex-col outline-none">
             {renderPreviewColumn()}
          </TabsContent>
        </Tabs>

        {/* Desktop View (Grid) */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          <div className="lg:col-span-5 flex flex-col gap-6">
            {renderInputColumn()}
          </div>
          <div className="lg:col-span-7 h-full flex flex-col">
            {renderPreviewColumn()}
          </div>
        </div>
      </div>
    </div>
  )

  function renderInputColumn() {
    return (
      <>
        {/* Logo Uploader */}
        <Card className="glass-premium border-white/10 rounded-[1.5rem] bg-[#02040a]/40 shrink-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-syne text-lg">Membrete Empresarial</CardTitle>
            <CardDescription className="font-pjs text-slate-400">Personaliza el documento con el sello o logo de tu agencia.</CardDescription>
          </CardHeader>
          <CardContent>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleLogoUpload}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer group"
            >
              {logoBase64 ? (
                <div className="flex flex-col items-center gap-2">
                   <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                   <span className="text-[11px] font-pjs font-bold text-emerald-400 uppercase tracking-widest">Logo Cargado Exitosamente</span>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
                  <span className="text-xs text-slate-400 font-pjs group-hover:text-indigo-300 transition-colors">Click o arrastra tu logotipo aquí</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prompt Terminal */}
        <Card className="glass-premium border-white/10 rounded-[1.5rem] bg-[#02040a]/40 flex-1 flex flex-col min-h-[300px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-syne text-lg">Centro de Mando IA</CardTitle>
            <CardDescription className="font-pjs text-slate-400">Describe con precisión qué documento necesitas redactar hoy.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
             {error && (
               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-3 text-red-400 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Error al conectar con la IA. Por favor, intenta de nuevo.</span>
               </div>
             )}
             <form 
               onSubmit={(e) => {
                 e.preventDefault();
                 if (!input.trim() || isLoading) return;
                 sendMessage({
                   role: "user",
                   parts: [{ type: "text", text: input.trim() }],
                 });
                 setInput("");
               }} 
               className="flex flex-col h-full gap-4"
             >
               <Textarea 
                 placeholder="Ej: Redacta una carta poder aduanera donde la empresa CyberLogistics autoriza a A-G-A a nacionalizar mercancía tecnológica valorada en $50k..."
                 className="flex-1 bg-white/5 border-white/10 rounded-2xl text-white resize-none p-4 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 font-pjs text-sm"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 disabled={isLoading}
               />
               <Button 
                 type="submit" 
                 disabled={isLoading || !input?.trim()}
                 className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-pjs font-bold rounded-xl gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)] h-12 shrink-0"
               >
                 {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                 {isLoading ? "Generando Documento..." : "Redactar Documento"}
               </Button>
             </form>
          </CardContent>
        </Card>
      </>
    )
  }

  function renderPreviewColumn() {
    return (
      <>
        <div className="mb-4 flex justify-between items-center shrink-0">
          <h3 className="text-[10px] font-pjs font-bold text-slate-400 uppercase tracking-widest ml-2">Previsualización (Render de Hoja)</h3>
          <Button 
            onClick={exportToPDF} 
            disabled={!latestDocumentText || isExporting}
            variant="outline" 
            className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest h-8 px-4 rounded-xl"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Exportar a PDF
          </Button>
        </div>
        
        {/* Canvas Container */}
        <div className="glass-premium rounded-[2rem] border-white/10 bg-slate-900 overflow-hidden flex-1 relative flex items-center justify-center p-4 md:p-8">
           {!latestDocumentText && !isLoading && (
              <div className="text-center absolute inset-0 flex flex-col items-center justify-center opacity-50">
                 <FileSignature className="h-16 w-16 text-slate-600 mb-4" />
                 <p className="text-slate-400 font-pjs text-sm">Esperando instrucciones de la IA...</p>
              </div>
           )}
           
           {/* Virtual A4 Paper / Letter used by html2canvas */}
           {latestDocumentText && (
             <div className="w-full h-full overflow-y-auto overflow-x-auto custom-scrollbar flex justify-start md:justify-center py-4 relative z-10 transition-all">
               {/* Mobile Scaling Wrapper */}
               <div className="scale-[0.55] sm:scale-100 origin-top h-fit md:h-full">
                <div 
                  ref={documentRef}
                  id="document-canvas-area"
                  className="bg-white min-h-[792px] w-[612px] shadow-2xl p-12 shrink-0 text-slate-900 font-serif leading-relaxed text-[10pt]"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                >
                   {/* Logo Injection Area */}
                   {logoBase64 && (
                     <div className="mb-8 border-b-2 border-slate-900/10 pb-6 text-center">
                       <img src={logoBase64} alt="Company Logo" className="max-h-24 mx-auto object-contain" />
                     </div>
                   )}
                   
                   {/* Markdown Document Area */}
                   <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-800 prose-p:text-justify prose-strong:text-black">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {latestDocumentText}
                      </ReactMarkdown>
                   </div>
                </div>
               </div>
             </div>
           )}
        </div>
      </>
    )
  }
}
