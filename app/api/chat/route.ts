import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';

// Configuración explícita del proveedor de Google
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
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
      const embedding = await getEmbedding(lastMessage);
      const supabase = await createServerSideClient();
      const { data: matches, error: rpcError } = await supabase.rpc('match_aranceles', {
        query_embedding: embedding,
        match_threshold: 0.6,
        match_count: 3,
      });

      if (rpcError) console.error("[Chat] RPC Match Error:", rpcError);

      if (matches && matches.length > 0) {
        systemContext = "\n[Contexto Real Encontrado]:\n";
        matches.forEach((m: any) => {
          const alertas = m.restricciones && m.restricciones.length > 0
            ? m.restricciones.map((r: any) => `${r.tipo}: ${r.descripcion}`).join(", ")
            : "Ninguna";
          systemContext += `Producto: ${m.name}, Arancel: ${m.standard_arancel}%, Alertas: ${alertas}\n`;
        });
      }
      console.log(`[Chat] RAG completado en ${Date.now() - ragStart}ms`);
    } catch (ragError: any) {
      console.error("[Chat] RAG Exception:", ragError.message);
    }

    const FINAL_SYSTEM_PROMPT = `
Eres A-G-A (Asistente de Gestión Aduanal).
Instrucciones: Responde usando el [Contexto Real] si existe. Si no, pide detalles.
Estructura: Resumen, Desglose, Alertas.
${systemContext}
`;

    // ── PASO 2: Streaming con Gemini ──
    try {
      const result = await streamText({
        model: googleProvider('gemini-1.5-flash'),
        system: FINAL_SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        temperature: 0.1,
        onFinish: async ({ text }) => {
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
            } catch (e) {
              console.error("[Chat] Saving history failed:", e);
            }
          }
        }
      });

      return result.toTextStreamResponse();
    } catch (streamError: any) {
      console.error("[Chat] Gemini Call Error:", streamError);
      return new Response(JSON.stringify({ 
        error: "Error en el motor de IA",
        details: streamError.message || "La API de Google no respondió correctamente.",
        code: "GEMINI_ERROR"
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error: any) {
    console.error("[Chat] Critical Parsing Error:", error);
    return new Response(JSON.stringify({ 
      error: "Error de Servidor",
      details: "No se pudo procesar la petición. Revisa los logs.",
      code: "PARSE_ERROR"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
