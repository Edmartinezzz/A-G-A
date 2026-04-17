import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getEmbedding } from '@/lib/embeddings';
import { createServerSideClient } from '@/lib/supabase-server';
import { calcularCostosNacionalizacion } from '@/lib/aduanas/calculadora';

/**
 * Fase 5: Extractor de Visión Estructurada y Pipeline de Clasificación
 */
export async function POST(req: Request) {
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

    // ── PASO 1: Extracción Visual Estructurada (OpenAI GPT-4o) ──
    const { object: visualData } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        nombre_tecnico: z.string().describe('Nombre específico y técnico del producto.'),
        material_principal: z.string().describe('Material del que está hecho mayoritariamente.'),
        uso_previsto: z.string().describe('Función o uso del producto.'),
        hs_code_sugerido_6_digitos: z.string().describe('Subpartida arancelaria a 6 dígitos estimada.'),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analiza detalladamente esta imagen para propósitos de clasificación aduanera.' },
            { type: 'image', image: base64Data },
          ],
        },
      ],
    });

    // ── PASO 2: Búsqueda del Arancel Real en la Base de Datos (RAG) ──
    const embedding = await getEmbedding(visualData.nombre_tecnico);
    const supabase = await createServerSideClient();
    
    const { data: matches, error: rpcError } = await supabase.rpc('match_aranceles', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1, // Tomamos la mejor coincidencia
    });

    const matchReal = matches && matches.length > 0 ? matches[0] : null;

    // ── PASO 3: Motor de Cálculo Determinista (Fase 3) ──
    // Si no hay match real, usamos el arancel sugerido por la IA o 0
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
        analisis_visual: visualData,
        database_match: matchReal ? {
          nombre_oficial: matchReal.name,
          hs_code_oficial: matchReal.hs_code,
          similitud: Math.round(matchReal.similarity * 100) + "%",
          restricciones: matchReal.restricciones
        } : { info: "No se encontró coincidencia exacta en la base de datos maestra" },
        calculo_estimado: calculo
      }
    });

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return Response.json({ error: error.message || "Error procesando el pipeline de visión" }, { status: 500 });
  }
}
