-- ============================================================
-- A-G-A — FASE 2: Motor de Búsqueda Semántica (pgvector)
-- ============================================================

-- 1. Habilitar la extensión de vectores
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Renombrar tablas para alinearse con la arquitectura solicitada
-- products -> aranceles_maestros
ALTER TABLE IF EXISTS products RENAME TO aranceles_maestros;
-- customs_rules -> restricciones_legales
ALTER TABLE IF EXISTS customs_rules RENAME TO restricciones_legales;

-- 3. Actualizar la columna de vectores en aranceles_maestros (Dimensión 768 para Groq/Modelos Abiertos)
ALTER TABLE aranceles_maestros 
ADD COLUMN IF NOT EXISTS vector vector(768);

-- 4. Crear Índice HNSW para búsquedas semánticas ultrarrápidas (operador de distancia del coseno)
CREATE INDEX IF NOT EXISTS idx_aranceles_maestros_vector 
ON aranceles_maestros USING hnsw (vector vector_cosine_ops);

-- 5. Crear la función RPC match_aranceles
-- Esta función busca por significado y hace JOIN con restricciones legales
CREATE OR REPLACE FUNCTION match_aranceles (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  hs_code TEXT,
  name TEXT,
  description TEXT,
  standard_arancel NUMERIC,
  similarity float,
  restricciones JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.id,
    am.hs_code,
    am.name,
    am.description,
    am.standard_arancel,
    1 - (am.vector <=> query_embedding) AS similarity,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', rl.id,
          'tipo', rl.restriction_type,
          'descripcion', rl.description
        )
      ) FILTER (WHERE rl.id IS NOT NULL),
      '[]'::jsonb
    ) AS restricciones
  FROM aranceles_maestros am
  LEFT JOIN restricciones_legales rl ON am.id = rl.product_id
  WHERE 1 - (am.vector <=> query_embedding) > match_threshold
  GROUP BY am.id
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 6. Actualizar Políticas RLS para los nuevos nombres
-- aranceles_maestros (Solo lectura para usuarios autenticados)
DROP POLICY IF EXISTS "products_select_authenticated" ON aranceles_maestros;
CREATE POLICY "aranceles_maestros_select_authenticated" ON aranceles_maestros 
  FOR SELECT TO authenticated USING (true);

-- restricciones_legales (Solo lectura para usuarios autenticados)
DROP POLICY IF EXISTS "customs_rules_select_authenticated" ON restricciones_legales;
CREATE POLICY "restricciones_legales_select_authenticated" ON restricciones_legales 
  FOR SELECT TO authenticated USING (true);

-- Denegar acceso anónimo (Ya configurado globalmente, pero por seguridad extra)
ALTER TABLE aranceles_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE restricciones_legales ENABLE ROW LEVEL SECURITY;
