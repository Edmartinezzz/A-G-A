import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';

// ── PROVEEDORES DE SEGURIDAD (CEREBROS ALTERNATIVOS) ──
const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const huggingface = createOpenAI({
  apiKey: process.env.HUGGINGFACE_TOKEN,
  baseURL: 'https://api-inference.huggingface.co/v1',
});

const siliconflow = createOpenAI({
  apiKey: process.env.SILICON_FLOW_API_KEY,
  baseURL: 'https://api.siliconflow.cn/v1',
});

export async function POST(req: Request) {
  const startTime = Date.now();
  
  // ── PRE-CHECK: Configuración del Sistema ──
  const userId = req.headers.get('x-aga-user-id');
  const userEmail = req.headers.get('x-aga-user-email');

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

    let systemContext = "";

    // ── PASO 1: RAG (Recuperación Semántica) ──
    try {
      const ragStart = Date.now();
      const embedding = await getEmbedding(lastMessage);
      const supabase = await createServerSideClient();
      const { data: matches, error: rpcError } = await supabase.rpc('match_aranceles', {
        query_embedding: embedding,
        match_threshold: 0.4, // Más flexible para el modo diagnóstico
        match_count: 3,
      });

      if (matches && matches.length > 0) {
        systemContext = "\n[Contexto Real Encontrado]:\n";
        matches.forEach((m: any) => {
          const alertas = m.restricciones && m.restricciones.length > 0
            ? m.restricciones.map((r: any) => `${r.tipo}: ${r.descripcion}`).join(", ")
            : "Ninguna";
          systemContext += `Producto: ${m.name}, Arancel: ${m.standard_arancel}%, Alertas: ${alertas}\n`;
        });
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

    // ── ESTRATEGIA MULTI-CEREBRO ──
    
    // Función auxiliar para guardar el historial independientemente de qué cerebro responda
    const onFinishGeneration = async ({ text }: { text: string }) => {
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
    };

    // Intento 1: GEMINI (Google)
    try {
      console.log(`[CEREBRO 1] Intentando Gemini (${Date.now() - startTime}ms)...`);
      const result = await streamText({
        model: google('gemini-1.5-flash'),
        system: FINAL_SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        temperature: 0.1,
        onFinish: onFinishGeneration
      });
      return result.toUIMessageStreamResponse();
    } catch (e1) {
      console.error("[!] CEREBRO 1 (Gemini) falló:", (e1 as any).message);
      
      // Intento 2: GROQ (Llama 3)
      try {
        console.log(`[CEREBRO 2] Intentando Groq Llama 3 (${Date.now() - startTime}ms)...`);
        const result = await streamText({
          model: groq('llama-3.1-70b-versatile'),
          system: FINAL_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
          temperature: 0.1,
          onFinish: onFinishGeneration
        });
        return result.toUIMessageStreamResponse();
      } catch (e2) {
        console.error("[!] CEREBRO 2 (Groq) falló:", (e2 as any).message);
        
        // Intento 3: SILICONFLOW (DeepSeek V3)
        try {
          console.log(`[CEREBRO 3] Intentando SiliconFlow DeepSeek (${Date.now() - startTime}ms)...`);
          const result = await streamText({
            model: siliconflow('deepseek-ai/DeepSeek-V3'),
            system: FINAL_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            temperature: 0.1,
            onFinish: onFinishGeneration
          });
          return result.toUIMessageStreamResponse();
        } catch (e3) {
          console.error("[!] CEREBRO 3 (SiliconFlow) falló:", (e3 as any).message);

          // Intento 4: HUGGING FACE (Llama 8B)
          try {
            console.log(`[CEREBRO 4] Intentando Hugging Face (${Date.now() - startTime}ms)...`);
            const result = await streamText({
              model: huggingface('meta-llama/Llama-3.1-8B-Instruct'),
              system: FINAL_SYSTEM_PROMPT,
              messages: await convertToModelMessages(messages),
              temperature: 0.1,
              onFinish: onFinishGeneration
            });
            return result.toUIMessageStreamResponse();
          } catch (e4) {
            console.error("[!] CEREBRO 4 (Hugging Face) falló:", (e4 as any).message);
            
            return new Response(JSON.stringify({ 
              error: "Fallo Multicerebro", 
              details: "Todos los motores de IA fallaron simultáneamente. Revisa tu conexión o créditos.", 
              code: 'TOTAL_BRAIN_FAILURE' 
            }), { status: 500 });
          }
        }
      }
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
