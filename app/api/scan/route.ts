import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';
import { calcularCostosNacionalizacion } from '@/lib/aduanas/calculadora';
import { searchWeb } from '@/lib/search-serper';

// Configuración de Groq para Visión (Respaldo rápido)
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
 * Fase FINAL: Pipeline de Visión Ultra-Rápido (Optimizado para Vercel)
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { 
      imageBase64, 
      valorFOB = 1000, 
      flete = 200, 
      seguro = null,
      tasaIVA = 16,
      tasaServicioAduanal = 1
    } = await req.json();

    if (!imageBase64) {
      return Response.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 });
    }

    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    let visualData: any = null;
    let fallbackCerebro = "Desconocido";

    // ── PASO 1: Análisis Visual Prioritario (Gemini 1.5 Flash) ──
    // Elegimos Gemini como primario por ser el más estable y rápido en visión integrada.
    const visionSystemPrompt = 'Analiza detalladamente esta imagen para propósitos de clasificación aduanera. Extrae datos precisos en formato JSON.';
    
    try {
      console.log(`[SCAN-1] Intentando Gemini (Primario)...`);
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
      fallbackCerebro = "Gemini Flash (Estable)";
    } catch (e1: any) {
      console.warn("[!] Gemini fallback activado:", e1.message);
      
      // Fallback a Groq (Llama 3.2 11B Vision) - Lo más rápido si Gemini falla
      try {
        console.log(`[SCAN-2] Intentando Groq (Respaldo)...`);
        const { object } = await generateObject({
          model: groq('llama-3.2-11b-vision-preview'),
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
        fallbackCerebro = "Groq Llama 3.2 (Respaldo)";
      } catch (e2: any) {
        console.error("[!] Total Vision failure.");
        throw new Error("Ningún motor de visión pudo analizar la imagen en el tiempo límite.");
      }
    }

    // ── PASO 2: Búsqueda Semántica en Base de Datos (RAG) ──
    const embedding = await getEmbedding(visualData.nombre_tecnico);
    const supabase = await createServerSideClient();
    
    const { data: matches } = await supabase.rpc('match_aranceles', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1, 
    });

    let matchReal = matches && matches.length > 0 ? matches[0] : null;
    let webContext = "";

    // ── PASO 3: Web Discovery (Opcional, solo si hay tiempo) ──
    // Si la búsqueda DB fue buena (> 75% similitud), saltamos la web para ahorrar tiempo.
    if (!matchReal || matchReal.similarity < 0.75) {
      try {
        const searchResults = await searchWeb(`arancel venezuela ${visualData.nombre_tecnico}`);
        if (searchResults && searchResults.length > 0) {
          webContext = searchResults[0].snippet;
        }
      } catch (sErr) {
        console.log("Web search skipped or failed.");
      }
    }

    // ── PASO 4: Cálculo de Impuestos ──
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
        cerebro_activo: fallbackCerebro,
        analisis_visual: visualData,
        web_discovery: webContext || "Clasificación mediante base de datos maestra",
        database_match: matchReal ? {
          nombre_oficial: matchReal.name,
          hs_code_oficial: matchReal.hs_code,
          similitud: Math.round(matchReal.similarity * 100) + "%",
          restricciones: matchReal.restricciones
        } : { info: "Resultados basados en análisis visual heurístico." },
        calculo_estimado: calculo,
        timing: Date.now() - startTime
      }
    });

  } catch (error: any) {
    console.error("Scanner Pipeline Error:", error);
    return Response.json({ 
      error: error.message || "Error en el pipeline de visión",
      code: 'SCAN_FAILURE'
    }, { status: 500 });
  }
}
