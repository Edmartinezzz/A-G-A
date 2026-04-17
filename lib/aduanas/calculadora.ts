/**
 * lib/aduanas/calculadora.ts
 * 
 * Motor financiero determinista para el cálculo de costos de nacionalización.
 * Este módulo evita el uso de IA para garantizar precisión contable y legal.
 */

export interface DatosEntradaCalculo {
  valorFOB: number;
  flete: number;
  seguro?: number | null;
  tasaArancelaria: number; // Porcentaje (ej. 15 para 15%)
  tasaIVA: number;         // Porcentaje (ej. 16 para 16%)
  tasaServicioAduanal: number; // Porcentaje (ej. 1 para 1%)
}

export interface ResultadoCalculoAduanero {
  valorCIF: number;
  impuestoAdValorem: number;
  tasaAduanera: number;
  baseImponibleIVA: number;
  montoIVA: number;
  totalAPagarAduana: number;
  desglose: {
    fob: number;
    flete: number;
    seguro: number;
    arancelPorcentaje: number;
    ivaPorcentaje: number;
    servicioAduanalPorcentaje: number;
  };
}

/**
 * Redondea un número a 2 decimales de forma exacta.
 */
function redondear(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula los costos de nacionalización basados en la normativa aduanera estándar.
 */
export function calcularCostosNacionalizacion(
  datos: DatosEntradaCalculo
): ResultadoCalculoAduanero {
  const { 
    valorFOB, 
    flete, 
    seguro, 
    tasaArancelaria, 
    tasaIVA, 
    tasaServicioAduanal 
  } = datos;

  // 1. Calcular Seguro (Si es null, aplica tarifa plana del 2% del FOB por defecto legal)
  const seguroFinal = seguro !== null && seguro !== undefined 
    ? seguro 
    : valorFOB * 0.02;

  // 2. Valor CIF = FOB + Flete + Seguro
  const valorCIF = redondear(valorFOB + flete + seguroFinal);

  // 3. Impuesto Ad Valorem (Arancel) = CIF * (tasaArancelaria / 100)
  const impuestoAdValorem = redondear(valorCIF * (tasaArancelaria / 100));

  // 4. Tasa Aduanera (Administrativa) = CIF * (tasaServicioAduanal / 100)
  const tasaAduanera = redondear(valorCIF * (tasaServicioAduanal / 100));

  // 5. Base Imponible IVA = CIF + Impuesto Ad Valorem + Tasa Aduanera
  const baseImponibleIVA = redondear(valorCIF + impuestoAdValorem + tasaAduanera);

  // 6. Monto IVA = Base Imponible IVA * (tasaIVA / 100)
  const montoIVA = redondear(baseImponibleIVA * (tasaIVA / 100));

  // 7. Total a Pagar en Aduana = Impuesto Ad Valorem + Tasa Aduanera + Monto IVA
  const totalAPagarAduana = redondear(impuestoAdValorem + tasaAduanera + montoIVA);

  return {
    valorCIF,
    impuestoAdValorem,
    tasaAduanera,
    baseImponibleIVA,
    montoIVA,
    totalAPagarAduana,
    desglose: {
      fob: redondear(valorFOB),
      flete: redondear(flete),
      seguro: redondear(seguroFinal),
      arancelPorcentaje: tasaArancelaria,
      ivaPorcentaje: tasaIVA,
      servicioAduanalPorcentaje: tasaServicioAduanal,
    }
  };
}
