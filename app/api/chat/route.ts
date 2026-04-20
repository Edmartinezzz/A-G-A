import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';

// Forzamos el uso del endpoint v1 (Estable) en lugar de v1beta
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1',
});

export async function POST(req: Request) {
  const startTime = Date.now();
  
  // ── PRE-CHECK: Configuración del Sistema ──
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("[Chat] CRÍTICO: GOOGLE_GENERATIVE_AI_API_KEY no encontrada en variables de entorno.");
    return new Response(JSON.stringify({ 
      error: "Configuración Incompleta",
      details: "La API Key de Google no está configurada en el servidor (Vercel/Local).",
      code: "MISSING_API_KEY"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // 1. Identificar al usuario (vía Headers del Proxy)
  const userId = req.headers.get('x-aga-user-id');
  const userEmail = req.headers.get('x-aga-user-email');

  if (!userId) {
    console.warn("[Chat] Petición sin userId identificado.");
  }

  try {
    const body = await req.json();
    const { messages }: { messages: UIMessage[] } = body;
    
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensajes vacíos" }), { status: 400 });
    }

    const lastParts = messages[messages.length - 1]?.parts ?? [];
    const lastMessage = lastParts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('') || '';

    console.log(`[Chat] Usuario ${userEmail || 'Anon'}: "${lastMessage.slice(0, 30)}..."`);

    let systemContext = "";

    // ── PASO 1: RAG (Recuperación Semántica) ──
    try {
      const ragStart = Date.now();
      console.log(`[PASO 1] Generando embedding...`);
      const embedding = await getEmbedding(lastMessage);
      
      console.log(`[PASO 2] Buscando en Supabase (${Date.now() - ragStart}ms)...`);
      const supabase = await createServerSideClient();
      const { data: matches, error: rpcError } = await supabase.rpc('match_aranceles', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 3,
      });

      if (rpcError) console.error("[!] RPC Match Error:", rpcError);

      if (matches && matches.length > 0) {
        console.log(`[OK] ${matches.length} coincidencias encontradas.`);
        systemContext = "\n[Contexto Real Encontrado]:\n";
        matches.forEach((m: any) => {
          const alertas = m.restricciones && m.restricciones.length > 0
            ? m.restricciones.map((r: any) => `${r.tipo}: ${r.descripcion}`).join(", ")
            : "Ninguna";
          systemContext += `Producto: ${m.name}, Arancel: ${m.standard_arancel}%, Alertas: ${alertas}\n`;
        });
      } else {
        console.log(`[INFO] No se hallaron datos arancelarios específicos.`);
      }
    } catch (ragError: any) {
      console.error("[!] Error en RAG:", ragError.message);
    }

    const FINAL_SYSTEM_PROMPT = `
Eres A-G-A (Asistente de Gestión Aduanal).
Instrucciones: Responde usando el [Contexto Real] si existe. Si no, pide detalles.
Estructura: Resumen, Desglose, Alertas.
${systemContext}
`;

    console.log(`[PASO 3] Iniciando Stream con Gemini Pro (${Date.now() - startTime}ms)...`);
    const apiKeyExists = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log(`[DEBUG] API Key detectada: ${apiKeyExists ? 'SÍ' : 'NO'}`);

    // ── PASO 2: Streaming con Gemini ──
    try {
      // Inyectamos el prompt de sistema manualmente para evitar el error "systemInstruction" en v1
      const augmentedMessages = [
        { role: 'system', content: FINAL_SYSTEM_PROMPT } as any,
        ...messages
      ];

      const result = await streamText({
        model: googleProvider('gemini-1.5-flash'),
        messages: await convertToModelMessages(augmentedMessages),
        temperature: 0.1,
        onFinish: async ({ text }) => {
          console.log(`[PASO 4] Generación terminada. Guardando historial (${Date.now() - startTime}ms)...`);
          if (userId) {
            try {
              const supabase = await createServerSideClient();
              const assistantMessage = { 
                id: crypto.randomUUID(), 
                role: 'assistant', 
                parts: [{ type: 'text', text }], 
                createdAt: new Date() 
              };
              const fullHistory = [
                ...messages,
                assistantMessage
              ];
              await supabase.from('chat_history').upsert({
                user_id: userId,
                session_id: 'default',
                messages: fullHistory,
                updated_at: new Date()
              }, { onConflict: 'user_id, session_id' });
              console.log("[OK] Historial sincronizado.");
            } catch (e) {
              console.error("[!] Error al sincronizar historial:", e);
            }
          }
        }
      });

      return result.toUIMessageStreamResponse();
    } catch (genError: any) {
      console.error("[!] Error en Gemini:", genError);
      return new Response(JSON.stringify({ 
        error: "Fallo Motor IA", 
        details: genError.message, 
        code: 'GEMINI_FAIL' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error: any) {
    console.error("[!] Error Crítico de Servidor:", error);
    return new Response(JSON.stringify({ 
      error: "Error Interno", 
      details: error.message, 
      code: 'SERVER_CRASH' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
