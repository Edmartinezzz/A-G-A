import { createOpenAI } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';

// 1. Configurar el cliente de Groq
const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Fase 4: Orquestador RAG del Chat (El "Experto")
 * El sistema inyecta datos reales antes de responder para evitar alucinaciones.
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

    let systemContext = "";

    // ── PASO 1: Recuperación Semántica (RAG) ──
    if (lastMessage) {
      try {
        // Generar embedding (768 dim via HuggingFace)
        const embedding = await getEmbedding(lastMessage);

        // Consultar match_aranceles en Supabase
        const supabase = await createServerSideClient();
        const { data: matches, error } = await supabase.rpc('match_aranceles', {
          query_embedding: embedding,
          match_threshold: 0.6, // Mayor rigor para evitar ruido
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
        console.error("RAG Error details:", ragError);
        // Fallback: continúa sin contexto real si hay error en la DB o embeddings
      }
    }

    // ── PASO 2: Prompt Maestro Estricto ──
    const FINAL_SYSTEM_PROMPT = `
Eres A-G-A (Asistente de Gestión Aduanal). 
Tu misión es dar información técnica veraz sobre importación y exportación.

INSTRUCCIONES CRÍTICAS:
1. Usa ESTRICTAMENTE el [Contexto Real] provisto para responder. 
2. Si el contexto está vacío o no encuentras el producto específico, responde informando que no tienes datos exactos en tu base de conocimiento y PIDE MÁS DETALLES al usuario.
3. NUNCA INVENTES porcentajes arancelarios ni normativas si no están en el contexto.
4. Tu respuesta DEBE seguir esta estructura obligatoriamente:
   1. Resumen: (Breve explicación de lo encontrado o solicitado)
   2. Desglose: (Tasas, códigos HS y datos técnicos)
   3. Alertas Legales: (Permisos asociados, prohibiciones o avisos relevantes)

${systemContext}
`;

    // ── PASO 3: Ejecución en Groq ──
    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: FINAL_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: 0.1, // Baja temperatura para mayor fidelidad técnica
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
