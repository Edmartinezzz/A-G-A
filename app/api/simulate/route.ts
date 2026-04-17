import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { product, origin, incoterm, value } = await req.json();

    const SYSTEM_PROMPT = `
Eres un analista experto en comercio exterior y normativas del SENIAT (Venezuela).
Se require generar un reporte de viabilidad y riesgos para una importación con los siguientes datos:
- Producto: ${product}
- Origen: ${origin}
- Destino: Venezuela
- Incoterm: ${incoterm}
- Valor FOB aproximado: $${value}

Genera un reporte corto en formato Markdown que incluya:
1. Posible clasificación arancelaria (HS Code) y arancel estimado.
2. Análisis de riesgos y responsabilidades bajo el Incoterm ${incoterm}.
3. Permisos o certificados exigibles (Ej: SENCAMER, INSAI, permisos sanitarios en Venezuela).
4. Un resumen de la viabilidad logística.
Mantén la respuesta concisa y profesional.
`;

    const result = await generateText({
      model: openai('gpt-4o'),
      prompt: SYSTEM_PROMPT,
    });

    return Response.json({ report: result.text });
  } catch (error) {
    return Response.json({ error: "No se pudo generar la simulación" }, { status: 500 });
  }
}
