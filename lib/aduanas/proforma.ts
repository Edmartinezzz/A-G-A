import { createServerSideClient } from '@/lib/supabase-server';

/**
 * Fase 7: Generador de Data Payload para Factura Proforma
 * Genera un JSON estructurado listo para ser consumido por generadores de PDF.
 */

export interface ProformaPayload {
  ticketNumber: string;
  fechaEmision: string;
  cliente: {
    nombre: string;
    empresa: string;
    email: string;
  };
  detalleMercancia: {
    nombre: string;
    material: string;
    uso: string;
    hsCode: string;
  };
  liquidacionFinanciera: {
    valorFOB: number;
    flete: number;
    seguro: number;
    valorCIF: number;
    impuestoAdValorem: number;
    tasaAduanera: number;
    montoIVA: number;
    totalAPagar: number;
  };
  disclaimerLegal: string;
}

/**
 * Genera el payload estructurado para una simulación específica.
 */
export async function generateProformaPayload(idSimulacion: string): Promise<ProformaPayload> {
  const supabase = await createServerSideClient();

  // 1. Obtener datos de la simulación y el perfil del usuario
  const { data: simulation, error: simError } = await supabase
    .from('simulations')
    .select(`
      *,
      profiles (
        full_name,
        company_name,
        email
      )
    `)
    .eq('id', idSimulacion)
    .single();

  if (simError || !simulation) {
    throw new Error(`No se encontró la simulación: ${simError?.message}`);
  }

  // 2. Generar Número de Ticket (Si no existe ya en la DB)
  // Formato: AGA-[AÑO]-[ID_CORTO]
  const fecha = new Date(simulation.created_at);
  const year = fecha.getFullYear();
  const shortId = simulation.id.split('-')[0].toUpperCase();
  const ticketNumber = simulation.ticket_number || `AGA-${year}-${shortId}`;

  // 3. Estructurar el Payload
  const payload: ProformaPayload = {
    ticketNumber,
    fechaEmision: fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    cliente: {
      nombre: simulation.profiles?.full_name || 'Cliente Particular',
      empresa: simulation.profiles?.company_name || 'N/A',
      email: simulation.profiles?.email || 'N/A'
    },
    detalleMercancia: {
      nombre: simulation.product_data?.nombre_tecnico || 'N/A',
      material: simulation.product_data?.material_principal || 'N/A',
      uso: simulation.product_data?.uso_previsto || 'N/A',
      hsCode: simulation.product_data?.hs_code_sugerido_6_digitos || 'N/A'
    },
    liquidacionFinanciera: {
      valorFOB: simulation.costs?.desglose?.fob || 0,
      flete: simulation.costs?.desglose?.flete || 0,
      seguro: simulation.costs?.desglose?.flete || 0,
      valorCIF: simulation.costs?.valorCIF || 0,
      impuestoAdValorem: simulation.costs?.impuestoAdValorem || 0,
      tasaAduanera: simulation.costs?.tasaAduanera || 0,
      montoIVA: simulation.costs?.montoIVA || 0,
      totalAPagar: simulation.costs?.totalAPagarAduana || 0
    },
    disclaimerLegal: "AVISO LEGAL: Este documento es una simulación generada por la plataforma A-G-A. Los cálculos son estimaciones basadas en la normativa vigente. Documento no válido para declaración aduanera definitiva."
  };

  return payload;
}
