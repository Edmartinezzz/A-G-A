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
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    const lastParts = messages[messages.length - 1]?.parts ?? [];
    const lastMessage = lastParts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('') || '';

    console.log(`[Chat] Iniciando procesamiento para: "${lastMessage.slice(0, 30)}..."`);

    let systemContext = "";

    // ── PASO 1: RAG con Log de Tiempo ──
    if (lastMessage) {
      try {
        const ragStart = Date.now();
        const embedding = await getEmbedding(lastMessage);
        const supabase = await createServerSideClient();
        const { data: matches, error } = await supabase.rpc('match_aranceles', {
          query_embedding: embedding,
          match_threshold: 0.6,
          match_count: 3, // Reducimos a 3 para mayor velocidad
        });

        if (!error && matches && matches.length > 0) {
          systemContext = "\n[Contexto Real Encontrado]:\n";
          matches.forEach((m: any) => {
            const alertas = m.restricciones && m.restricciones.length > 0
              ? m.restricciones.map((r: any) => `${r.tipo}: ${r.descripcion}`).join(", ")
              : "Ninguna";
            systemContext += `Producto: ${m.name}, Arancel: ${m.standard_arancel}%, Alertas: ${alertas}\n`;
          });
        }
        console.log(`[Chat] RAG completado en ${Date.now() - ragStart}ms`);
      } catch (ragError) {
        console.error("[Chat] RAG Error (continuando sin contexto):", ragError);
      }
    }

    const FINAL_SYSTEM_PROMPT = `
Eres A-G-A (Asistente de Gestión Aduanal).
Instrucciones: Responde usando el [Contexto Real] si existe. Si no, pide detalles.
Estructura: Resumen, Desglose, Alertas.
${systemContext}
`;

    // ── PASO 2: Streaming con Gemini ──
    console.log("[Chat] Llamando a Gemini 1.5 Flash...");
    
    try {
      const result = await streamText({
        model: googleProvider('gemini-1.5-flash'), // Nombre de modelo más estable
        system: FINAL_SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        temperature: 0.1,
      });

      console.log(`[Chat] Stream iniciado con éxito en ${Date.now() - startTime}ms`);
      return result.toTextStreamResponse();
    } catch (streamError: any) {
      console.error("[Chat] Error en la llamada de streaming de Gemini:", streamError);
      throw streamError;
    }
  } catch (error: any) {
    console.error("[Chat] Error Crítico:", error);
    return new Response(JSON.stringify({ 
      error: "Error en el asistente A-G-A",
      details: error.message || "Error desconocido",
      type: error.name || "ChatError"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
