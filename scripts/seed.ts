import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Necesita permisos de service_role para bypass RLS si es necesario
);

const SAMPLE_PRODUCTS = [
  {
    hs_code: '8471.30.00',
    name: 'Máquinas automáticas para tratamiento o procesamiento de datos, portátiles (Laptops/Notebooks)',
    description: 'Computadoras portátiles, incluyendo tablets y notebooks de peso inferior a 10kg.',
    standard_arancel: 0,
    ente: 'SENIAT',
    restricciones: [
      { tipo: 'Permiso', descripcion: 'Requiere Certificado de Conformidad SENCAMER' }
    ]
  },
  {
    hs_code: '8517.13.00',
    name: 'Teléfonos inteligentes (Smartphones)',
    description: 'Teléfonos móviles para redes celulares o para otras redes inalámbricas.',
    standard_arancel: 5,
    ente: 'CONATEL',
    restricciones: [
      { tipo: 'Registro', descripcion: 'Requiere Homologación ante CONATEL' }
    ]
  },
  {
    hs_code: '6403.91.90',
    name: 'Calzado de deporte con suela de caucho y parte superior de cuero natural',
    description: 'Zapatos deportivos, tenis, calzado de basquetbol y similares para hombres o mujeres.',
    standard_arancel: 20,
    ente: 'SENIAT',
    restricciones: []
  },
  {
    hs_code: '8703.80.00',
    name: 'Vehículos automóviles concebidos principalmente para el transporte de personas, propulsados mediante motor eléctrico',
    description: 'Vehículos 100% eléctricos (EV) para transporte de pasajeros.',
    standard_arancel: 0,
    ente: 'MIN-INDUSTRIAS',
    restricciones: [
      { tipo: 'Licencia', descripcion: 'Licencia de Importación de Vehículos Eléctricos' }
    ]
  },
  {
    hs_code: '8541.43.00',
    name: 'Células fotovoltaicas ensambladas en módulos o paneles (Paneles Solares)',
    description: 'Paneles solares para generación de energía fotovoltaica.',
    standard_arancel: 0,
    ente: 'SENIAT',
    restricciones: [
      { tipo: 'Incentivo', descripcion: 'Exento de IVA según Decreto de Energías Renovables' }
    ]
  }
];

async function seed() {
  console.log('🚀 Iniciando proceso de carga de datos local...');
  
  // Inicializar el modelo local (384 dimensiones - Rápido para Web)
  console.log('📦 Cargando modelo ligero (MiniLM)...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  for (const product of SAMPLE_PRODUCTS) {
    console.log(`\n📦 Procesando: ${product.hs_code}...`);
    
    // 1. Generar Vector Semántico Localmente
    const output = await extractor(product.name + " " + product.description, {
      pooling: 'mean',
      normalize: true,
    });
    
    const vector384 = Array.from(output.data);
    const padding = new Array(768 - vector384.length).fill(0);
    const vector = [...vector384, ...padding];
    
    // 2. Insertar en aranceles_maestros
    const { data: insertedProduct, error: prodError } = await supabase
      .from('aranceles_maestros')
      .insert({
        hs_code: product.hs_code,
        name: product.name,
        description: product.description,
        standard_arancel: product.standard_arancel,
        vector: vector
      })
      .select()
      .single();

    if (prodError) {
      console.error(`❌ Error insertando producto ${product.hs_code}:`, prodError.message);
      continue;
    }

    console.log(`✅ Producto insertado (ID: ${insertedProduct.id})`);

    // 3. Insertar Restricciones Legales si existen
    if (product.restricciones.length > 0) {
      const resp = await supabase.from('restricciones_legales').insert(
        product.restricciones.map(r => ({
          product_id: insertedProduct.id,
          restriction_type: r.tipo,
          description: r.descripcion
        }))
      );
      if (resp.error) console.error('❌ Error insertando restricciones:', resp.error.message);
      else console.log(`📋 ${product.restricciones.length} restricciones añadidas.`);
    }
  }

  console.log('\n✨ Proceso de carga finalizado con éxito.');
}

seed().catch(console.error);
