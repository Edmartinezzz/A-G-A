import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';
import { calcularCostosNacionalizacion } from '@/lib/aduanas/calculadora';
import { searchWeb } from '@/lib/search-serper';

// Configuración de Silicon Flow (Motor Principal Llama 3.2 Vision)
const siliconFlow = createOpenAI({
  apiKey: process.env.SILICON_FLOW_API_KEY,
  baseURL: 'https://api.siliconflow.cn/v1',
});

// Configuración de Groq (Respaldo)
const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Schema común para la extracción de datos de mercancía
const ScanSchema = z.object({
  nombre_tecnico: z.string().describe('Nombre específico y técnico del producto.'),
  material_principal: z.string().describe('Material del que está hecho mayoritariamente.'),
  uso_previsto: z.string().describe('Función o uso del producto.'),
  hs_code_sugerido_6_digitos: z.string().describe('Subpartida arancelaria a 6 dígitos estimada.'),
});

/**
 * Fase 7: Pipeline de Visión Versión 3 (Silicon Flow + Llama 3.2 Vision)
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { 
      imageBase64, 
      valorFOB = 1, // Default para simulación si no se envía
      flete = 0, 
      seguro = null,
      tasaIVA = 16,
      tasaServicioAduanal = 1
    } = await req.json();

    if (!imageBase64) {
      return Response.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 });
    }

    const base64Data = imageBase64.split(',')[1] || imageBase64;
    // Buffer es mejor para compatibilidad multiplataforma en el AI SDK
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    let visualData: any = null;
    let cerebroActivo = "Desconocido";

    // ── PASO 1: Análisis Visual (Silicon Flow Primary) ──
    const visionSystemPrompt = 'Eres un experto aduanero. Identifica el producto en la imagen y responde con su nombre técnico, material y HS Code sugerido.';
    
    try {
      console.log(`[SCAN-1] Intentando Silicon Flow (Llama 3.2 Vision)...`);
      const { object } = await generateObject({
        model: siliconFlow('Pro/meta-llama/Llama-3.2-11B-Vision-Instruct'),
        schema: ScanSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: visionSystemPrompt },
              { type: 'image', image: imageBuffer },
            ],
          },
        ],
      });
      visualData = object;
      cerebroActivo = "Silicon Flow (Version 3)";
    } catch (e1: any) {
      console.warn("[!] Silicon Flow falló:", e1.message);
      
      // Fallback 1: Gemini 1.5 Flash (Muy estable)
      try {
        console.log(`[SCAN-2] Intentando Gemini Flash fallback...`);
        const { object } = await generateObject({
          model: google('gemini-1.5-flash-latest'),
          schema: ScanSchema,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: visionSystemPrompt },
                { type: 'image', image: imageBuffer },
              ],
            },
          ],
        });
        visualData = object;
        cerebroActivo = "Gemini Flash (Respaldo)";
      } catch (e2: any) {
         console.error("[!] Total Vision failure.");
         throw new Error(`Error crítico en todos los cerebros de visión. Silicon: ${e1.message} | Gemini: ${e2.message}`);
      }
    }

    // ── PASO 2: Búsqueda Semántica de Aranceles Reales ──
    const embedding = await getEmbedding(visualData.nombre_tecnico);
    const supabase = await createServerSideClient();
    
    const { data: matches } = await supabase.rpc('match_aranceles', {
      query_embedding: embedding,
      match_threshold: 0.4, // Umbral un poco más flexible para asegurar resultados
      match_count: 1, 
    });

    let matchReal = matches && matches.length > 0 ? matches[0] : null;

    // ── PASO 3: Cálculo de Nacionalización ──
    const tasaFinal = matchReal ? Number(matchReal.standard_arancel) : 0;
    
    const calculo = calcularCostosNacionalizacion({
      valorFOB,
      flete,
      seguro,
      tasaArancelaria: tasaFinal,
      tasaIVA,
      tasaServicioAduanal
    });

    return Response.json({
      success: true,
      data: {
        cerebro_activo: cerebroActivo,
        analisis_visual: visualData,
        database_match: matchReal ? {
          nombre_oficial: matchReal.name,
          hs_code_oficial: matchReal.hs_code,
          similitud: Math.round(matchReal.similarity * 100) + "%",
          restricciones: matchReal.restricciones
        } : { info: "Clasificación basada en inteligencia visual heurística." },
        calculo_estimado: calculo,
        timing: Date.now() - startTime
      }
    });

  } catch (error: any) {
    console.error("Scanner V3 Error:", error);
    return Response.json({ 
      error: error.message || "Fallo crítico en el pipeline de visión",
      details: error.stack
    }, { status: 500 });
  }
}
