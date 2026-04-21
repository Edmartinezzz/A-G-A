import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

// ── PROVEEDORES DE SEGURIDAD (CEREBROS ALTERNATIVOS) ──
const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const siliconflow = createOpenAI({
  apiKey: process.env.SILICON_FLOW_API_KEY,
  baseURL: 'https://api.siliconflow.cn/v1',
});

const huggingface = createOpenAI({
  apiKey: process.env.HUGGINGFACE_TOKEN,
  baseURL: 'https://api-inference.huggingface.co/v1',
});

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensajes vacíos" }), { status: 400 });
    }

    const SYSTEM_PROMPT = `Eres el sistema "Redactor IA" de A-G-A (Asistente de Gestión Aduanal).
Tu único propósito es redactar documentos formales, legales, oficios, o contratos aduaneros basados en el prompt del usuario.

REGLAS ESTRICTAS:
1. NUNCA inicies con saludos o respuestas conversacionales como "¡Claro! Aquí tienes" o "Entendido".
2. Empieza inmediatamente con el contenido del documento, por ejemplo, con el Lugar y Fecha, o el Título del documento.
3. Formatea todo elegantemente en Markdown (usa ## para títulos, **negritas** para información clave, y listas si es necesario).
4. Si la solicitud carece de nombres o cifras, usa marcadores de posición profesionales como [NOMBRE DE LA EMPRESA] o [FECHA].
5. Escribe con un tono sumamente legal, profesional e institucional aplicable a aduanas y comercio exterior.
`;

    // ── ESTRATEGIA MULTI-CEREBRO PARA REDACTOR ──

    // INTENTO 1: GROQ (Llama 3)
    try {
      console.log(`[REDACTOR C1] Intentando Groq (${Date.now() - startTime}ms)...`);
      const result = await streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        temperature: 0.1,
      });
      return result.toUIMessageStreamResponse();
    } catch (e1) {
      console.error("[!] REDACTOR C1 (Groq) falló:", (e1 as any).message);

      // INTENTO 2: SILICONFLOW (DeepSeek V3)
      try {
        console.log(`[REDACTOR C2] Intentando SiliconFlow (${Date.now() - startTime}ms)...`);
        const result = await streamText({
          model: siliconflow('deepseek-ai/DeepSeek-V3'),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
          temperature: 0.1,
        });
        return result.toUIMessageStreamResponse();
      } catch (e2) {
        console.error("[!] REDACTOR C2 (SiliconFlow) falló:", (e2 as any).message);

        // INTENTO 3: GEMINI (Google)
        try {
          console.log(`[REDACTOR C3] Intentando Gemini (${Date.now() - startTime}ms)...`);
          const result = await streamText({
            model: google('gemini-1.5-flash'),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            temperature: 0.1,
          });
          return result.toUIMessageStreamResponse();
        } catch (e3) {
          console.error("[!] REDACTOR C3 (Gemini) falló:", (e3 as any).message);

          // INTENTO 4: HUGGING FACE (Llama 8B)
          try {
            console.log(`[REDACTOR C4] Intentando Hugging Face (${Date.now() - startTime}ms)...`);
            const result = await streamText({
              model: huggingface('meta-llama/Llama-3.1-8B-Instruct'),
              system: SYSTEM_PROMPT,
              messages: await convertToModelMessages(messages),
              temperature: 0.1,
            });
            return result.toUIMessageStreamResponse();
          } catch (e4) {
            console.error("[!] REDACTOR C4 (Hugging Face) falló:", (e4 as any).message);
            
            return new Response(JSON.stringify({ 
              error: "Fallo Multicerebro en Redactor", 
              details: "Todos los motores de IA fallaron. Revisa tu conexión o créditos.", 
              code: 'TOTAL_BRAIN_FAILURE' 
            }), { status: 500 });
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Doc Writer Error:", error)
    return new Response(JSON.stringify({ 
      error: "Error interno en Redactor",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
