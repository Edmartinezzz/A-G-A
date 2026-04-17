-- Schema para A-G-A (Asistente de Gestión Aduanal)

-- Tabla de Perfiles (Extensión de Auth.Users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Países y sus reglas generales
CREATE TABLE countries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    iso_code TEXT UNIQUE NOT NULL, -- e.g., 'VE', 'CN', 'US'
    currency TEXT NOT NULL,
    base_tax_rate NUMERIC DEFAULT 0, -- IVA base
    settings JSONB DEFAULT '{}', -- Reglas específicas del país
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Productos con HS Code (Cache/Base de Conocimiento)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    hs_code TEXT NOT NULL,
    category TEXT,
    standard_arancel NUMERIC, -- Arancel aduanero estándar
    is_prohibited BOOLEAN DEFAULT FALSE,
    requires_permit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reglas Aduaneras Específicas
CREATE TABLE customs_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    restriction_type TEXT, -- 'prohibido', 'permiso', 'inspeccion'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulaciones Realizadas por Usuarios
CREATE TABLE simulations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    country_origin_id UUID REFERENCES countries(id),
    country_dest_id UUID REFERENCES countries(id),
    product_data JSONB NOT NULL, -- Datos del producto simulado
    costs JSONB NOT NULL, -- Desglose de costos (CIF, FOB, IVA, Arancel)
    incoterm TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de Chats
CREATE TABLE chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]', -- Array de mensajes del chat
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Poliza básica: El usuario solo ve lo suyo
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view their own simulations" ON simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own chat history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
