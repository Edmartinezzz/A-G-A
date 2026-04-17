const { calcularCostosNacionalizacion } = require("../lib/aduanas/calculadora");

const datosPrueba = {
  valorFOB: 1000,
  flete: 200,
  seguro: null, // Debería aplicar el 2% de 1000 = 20
  tasaArancelaria: 20,
  tasaIVA: 16,
  tasaServicioAduanal: 1
};

const resultado = calcularCostosNacionalizacion(datosPrueba);

console.log("=== PRUEBA DE CÁLCULO ADUANERO ===");
console.log("Inputs:", JSON.stringify(datosPrueba, null, 2));
console.log("---------------------------------");
console.log("Resultado CIF (Esperado 1220):", resultado.valorCIF);
console.log("Arancel (20% de 1220 = 244):", resultado.impuestoAdValorem);
console.log("Tasa Aduanera (1% de 1220 = 12.20):", resultado.tasaAduanera);
console.log("Base IVA (1220 + 244 + 12.20 = 1476.20):", resultado.baseImponibleIVA);
console.log("IVA (16% de 1476.20 = 236.19):", resultado.montoIVA);
console.log("Total a Pagar (244 + 12.20 + 236.19 = 492.39):", resultado.totalAPagarAduana);
console.log("---------------------------------");
console.log("JSON Devuelto:", JSON.stringify(resultado, null, 2));
