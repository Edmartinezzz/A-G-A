-- ============================================================
-- A-G-A — Tabla de Documentos y Persistencia
-- ============================================================

-- 1. Crear la tabla de documentos
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'simulacion', 'factura', 'checklist', 'redactor'
    size TEXT, -- e.g., '1.2 MB'
    url TEXT, -- Opcional: URL si se sube a Storage
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" 
    ON public.documents FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents" 
    ON public.documents FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own documents" 
    ON public.documents FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- 4. Comentario de tabla
COMMENT ON TABLE public.documents IS 'Almacena metadatos de documentos generados o simulados por los usuarios de A-G-A.';
