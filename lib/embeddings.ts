import { google } from '@ai-sdk/google';
import { embed } from 'ai';

/**
 * lib/embeddings.ts
 * 
 * Generador de embeddings utilizando Google AI.
 * Modelo: text-embedding-004 (768 dimensiones).
 * Mucho más estable y preciso para búsquedas semánticas.
 */

/**
 * Genera un vector de 768 dimensiones para un texto dado.
 * Optimizado para la base de datos de aranceles de A-G-A.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const input = text.replace(/\n/g, " ");

    const { embedding } = await embed({
      model: google.embedding('text-embedding-004'),
      value: input,
    });

    // Google text-embedding-004 devuelve 768 dimensiones por defecto,
    // que es lo que espera nuestra base de datos.
    return embedding;
  } catch (error: any) {
    console.error("Error generating Google embedding:", error);
    
    // Fallback silencioso (Vector de ceros) para evitar romper el flujo si el servicio falla
    console.warn("Retornando vector nulo como fallback.");
    return new Array(768).fill(0);
  }
}
