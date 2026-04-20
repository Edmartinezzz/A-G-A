import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';

/**
 * Fase 4: Orquestador RAG del Chat (Motor de Google Gemini)
 * Migrado para mayor estabilidad y uso gratuito.
 */
export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    // Extract text from the parts array of the last message
    const lastParts = messages[messages.length - 1]?.parts ?? [];
    const lastMessage = lastParts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('') || '';

    console.log("Chat Process - Last User Message:", lastMessage);

    let systemContext = "";

    // ── PASO 1: Recuperación Semántica (RAG) ──
    if (lastMessage) {
      try {
        const embedding = await getEmbedding(lastMessage);
        const supabase = await createServerSideClient();
        const { data: matches, error } = await supabase.rpc('match_aranceles', {
          query_embedding: embedding,
          match_threshold: 0.6,
          match_count: 5,
        });

        if (!error && matches && matches.length > 0) {
          systemContext = "\n[Contexto Real Encontrado]:\n";
          matches.forEach((m: any) => {
            const alertas = m.restricciones && m.restricciones.length > 0
              ? m.restricciones.map((r: any) => `${r.tipo}: ${r.descripcion}`).join(", ")
              : "Ninguna";
              
            systemContext += `Producto: ${m.name}, Arancel: ${m.standard_arancel}%, Restricciones: ${alertas}\n`;
          });
        }
      } catch (ragError) {
        console.error("RAG logic error (non-fatal):", ragError);
      }
    }

    const FINAL_SYSTEM_PROMPT = `
Eres A-G-A (Asistente de Gestión Aduanal). 
Tu misión es dar información técnica veraz sobre importación y exportación.

INSTRUCCIONES CRÍTICAS:
1. Usa ESTRICTAMENTE el [Contexto Real] provisto para responder. 
2. Si el contexto está vacío, informa que no tienes datos exactos y pide más detalles.
3. NUNCA INVENTES porcentajes arancelarios.
4. Esquema obligatorio: Resumen, Desglose (Tasas/HS), Alertas Legales.

${systemContext}
`;

    // ── PASO 2: Ejecución en Gemini ──
    console.log("Streaming from Gemini 1.5 Flash...");
    const result = await streamText({
      model: google('gemini-1.5-flash-latest'),
      system: FINAL_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: 0.1,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Critical Chat Error:", error);
    return new Response(JSON.stringify({ 
      error: "Error interno en el asistente A-G-A",
      details: error.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
