import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';
import { calcularCostosNacionalizacion } from '@/lib/aduanas/calculadora';
import { searchWeb } from '@/lib/search-serper';

// Configuración de Groq para Visión
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
 * Fase 6: Pipeline de Visión Multi-Cerebro con Resiliencia Total
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
    let lastError = "";

    // ── PASO 1: Análisis Visual Multi-Cerebro ──
    const visionSystemPrompt = 'Analiza detalladamente esta imagen para propósitos de clasificación aduanera. Extrae datos precisos en formato JSON.';

    // Intento 1: GROQ (Llama 4 Scout) - Ultra-rápido y Multimodal
    try {
      console.log(`[SCAN-1] Intentando Groq Vision (${Date.now() - startTime}ms)...`);
      const { object } = await generateObject({
        model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
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
      fallbackCerebro = "Groq Llama 4";
    } catch (e1: any) {
      console.error("[!] Groq Vision falló:", e1.message);
      lastError = `Groq: ${e1.message}`;
      
      // Intento 2: OPENAI (GPT-4o) - Solo si hay API Key configurada
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      if (hasOpenAI) {
        try {
          console.log(`[SCAN-2] Intentando OpenAI GPT-4o (${Date.now() - startTime}ms)...`);
          const { object } = await generateObject({
            model: openai('gpt-4o'),
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
          fallbackCerebro = "OpenAI GPT-4o";
        } catch (e2: any) {
          console.error("[!] OpenAI Vision falló:", e2.message);
          lastError += ` | OpenAI: ${e2.message}`;
        }
      } else {
        console.log("[SCAN-SKIP] OpenAI saltado (Sin API Key)");
        lastError += " | OpenAI: Saltado (Sin Key)";
      }

      // Intento 3: GEMINI (1.5 Flash Latest) - Respaldo robusto si visualData sigue vacío
      if (!visualData) {
        try {
          console.log(`[SCAN-3] Intentando Gemini Vision (${Date.now() - startTime}ms)...`);
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
          fallbackCerebro = "Gemini Flash";
        } catch (e3: any) {
          console.error("[!] Total Vision failure.");
          lastError += ` | Gemini: ${e3.message}`;
          throw new Error(`Ningún motor de visión pudo analizar la imagen. Detalles: ${lastError}`);
        }
      }
    }

    // ── PASO 2: Búsqueda del Arancel Real en la Base de Datos (RAG) ──
    const embedding = await getEmbedding(visualData.nombre_tecnico);
    const supabase = await createServerSideClient();
    
    const { data: matches } = await supabase.rpc('match_aranceles', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1, 
    });

    let matchReal = matches && matches.length > 0 ? matches[0] : null;
    let webContext = "";

    // ── PASO 3: Inteligencia Web Autónoma (Si no hay match local claro) ──
    if (!matchReal || matchReal.similarity < 0.7) {
      console.log(`[SCAN-WEB] Realizando búsqueda web de apoyo...`);
      try {
        const searchResults = await searchWeb(`arancel aduana venezuela 2026 ${visualData.nombre_tecnico}`);
        if (searchResults && searchResults.length > 0) {
          webContext = searchResults.slice(0, 2).map(r => `${r.snippet} (Fuente: ${r.link})`).join("\n");
        }
      } catch (searchError) {
        console.error("[!] Error en búsqueda de apoyo para el escáner:", searchError);
      }
    }

    // ── PASO 4: Motor de Cálculo Determinista ──
    const tasaFinal = matchReal ? Number(matchReal.standard_arancel) : 0;
    
    const calculo = calcularCostosNacionalizacion({
      valorFOB,
      flete,
      seguro,
      tasaArancelaria: tasaFinal,
      tasaIVA,
      tasaServicioAduanal
    });

    // ── RESULTADO FINAL CONSOLIDADO ──
    return Response.json({
      success: true,
      data: {
        cerebro_activo: fallbackCerebro,
        analisis_visual: visualData,
        web_discovery: webContext || "Uso de base de datos maestra para clasificación",
        database_match: matchReal ? {
          nombre_oficial: matchReal.name,
          hs_code_oficial: matchReal.hs_code,
          similitud: Math.round(matchReal.similarity * 100) + "%",
          restricciones: matchReal.restricciones
        } : { info: "No se encontró coincidencia exacta en la base de datos local." },
        calculo_estimado: calculo,
        timing: Date.now() - startTime
      }
    });

  } catch (error: any) {
    console.error("Scanner Pipeline Error:", error);
    return Response.json({ 
      error: error.message || "Error procesando el pipeline de visión",
      code: 'SCAN_PIPELINE_FAILURE'
    }, { status: 500 });
  }
}
