/**
 * lib/embeddings.ts
 * 
 * Generador de embeddings gratuito utilizando la API de Inferencia de HuggingFace.
 * Modelo: sentence-transformers/all-MiniLM-L6-v2 (384 dimensiones).
 */

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

/**
 * Genera un vector de 384 dimensiones para un texto dado.
 * Optimizado para Web Apps (Ligero y Rápido).
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const input = text.replace(/\n/g, " ");

    const response = await fetch(HUGGINGFACE_API_URL, {
      headers: {
        "Content-Type": "application/json",
        ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
      },
      method: "POST",
      body: JSON.stringify({ inputs: input }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HuggingFace API Error Response: ${errorText.slice(0, 200)}...`);
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const vector384 = Array.isArray(result[0]) ? result[0] : result;

    // Zero-padding para compatibilidad con DB (384 -> 768)
    const padding = new Array(768 - vector384.length).fill(0);
    const vector768 = [...vector384, ...padding];

    return vector768;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
