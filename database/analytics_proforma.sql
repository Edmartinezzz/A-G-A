-- Migración para Fases 6 y 7
-- 1. Soporte para números de ticket en simulaciones
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS ticket_number TEXT;

-- 2. Función para obtener analíticas agrupadas para el Dashboard
-- Esta función optimiza la carga del frontend al enviar solo el resumen agregado.
CREATE OR REPLACE FUNCTION get_user_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH monthly_stats AS (
        SELECT 
            date_trunc('month', created_at) as month,
            SUM((costs->>'valorCIF')::numeric) as total_cif,
            SUM((costs->>'totalAPagarAduana')::numeric) as total_taxes
        FROM simulations
        WHERE user_id = auth.uid()
        GROUP BY 1
        ORDER BY 1 DESC
    ),
    top_hs_codes AS (
        SELECT 
            product_data->>'hs_code_sugerido_6_digitos' as hs_code,
            COUNT(*) as frequency
        FROM simulations
        WHERE user_id = auth.uid()
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 5
    )
    SELECT jsonb_build_object(
        'monthly_stats', (SELECT jsonb_agg(monthly_stats) FROM monthly_stats),
        'top_hs_codes', (SELECT jsonb_agg(top_hs_codes) FROM top_hs_codes)
    ) INTO result;
    
    RETURN result;
END;
$$;
