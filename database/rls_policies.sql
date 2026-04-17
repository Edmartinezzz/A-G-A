-- ============================================================
-- A-G-A — Políticas de Row Level Security (RLS)
-- Ejecutar en el SQL Editor de Supabase después de schema.sql
-- ============================================================

-- ============================================================
-- 0. PREPARACIÓN — Habilitar RLS en todas las tablas
--    (las tablas de usuario ya tienen RLS en schema.sql,
--     pero las repetimos aquí para dejar este archivo
--     como fuente única de verdad)
-- ============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history      ENABLE ROW LEVEL SECURITY;

-- Tablas maestras (solo lectura para usuarios autenticados)
ALTER TABLE countries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customs_rules     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. TABLA: profiles
--    Cada usuario gestiona SOLO su propio perfil.
-- ============================================================

-- Eliminar políticas anteriores (idempotente)
DROP POLICY IF EXISTS "profiles_select_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all"   ON profiles;

-- SELECT: el usuario ve solo su fila
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- INSERT: el usuario solo puede insertar su propia fila
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: el usuario solo actualiza su propia fila
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: el usuario solo borra su propia fila
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ADMIN: acceso total (requiere el rol 'admin' en app_metadata)
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- 2. TABLA: simulations
--    Cada usuario opera SOLO sobre sus propias simulaciones.
-- ============================================================

DROP POLICY IF EXISTS "simulations_select_own"  ON simulations;
DROP POLICY IF EXISTS "simulations_insert_own"  ON simulations;
DROP POLICY IF EXISTS "simulations_update_own"  ON simulations;
DROP POLICY IF EXISTS "simulations_delete_own"  ON simulations;
DROP POLICY IF EXISTS "simulations_admin_all"   ON simulations;

CREATE POLICY "simulations_select_own"
  ON simulations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "simulations_insert_own"
  ON simulations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "simulations_update_own"
  ON simulations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "simulations_delete_own"
  ON simulations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "simulations_admin_all"
  ON simulations FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- 3. TABLA: chat_history
--    Cada usuario opera SOLO sobre su propio historial.
-- ============================================================

DROP POLICY IF EXISTS "chat_history_select_own"  ON chat_history;
DROP POLICY IF EXISTS "chat_history_insert_own"  ON chat_history;
DROP POLICY IF EXISTS "chat_history_update_own"  ON chat_history;
DROP POLICY IF EXISTS "chat_history_delete_own"  ON chat_history;
DROP POLICY IF EXISTS "chat_history_admin_all"   ON chat_history;

CREATE POLICY "chat_history_select_own"
  ON chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chat_history_insert_own"
  ON chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_history_update_own"
  ON chat_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_history_delete_own"
  ON chat_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chat_history_admin_all"
  ON chat_history FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- 4. TABLAS MAESTRAS — Solo Lectura para usuarios autenticados
--    Nadie excepto el rol 'admin' puede INSERT/UPDATE/DELETE.
-- ============================================================

-- ─── countries ───────────────────────────────────────────────

DROP POLICY IF EXISTS "countries_select_authenticated" ON countries;
DROP POLICY IF EXISTS "countries_admin_write"          ON countries;

-- Cualquier usuario autenticado puede leer países
CREATE POLICY "countries_select_authenticated"
  ON countries FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede escribir
CREATE POLICY "countries_admin_write"
  ON countries FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── products ────────────────────────────────────────────────

DROP POLICY IF EXISTS "products_select_authenticated" ON products;
DROP POLICY IF EXISTS "products_admin_write"          ON products;

CREATE POLICY "products_select_authenticated"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "products_admin_write"
  ON products FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── customs_rules ───────────────────────────────────────────

DROP POLICY IF EXISTS "customs_rules_select_authenticated" ON customs_rules;
DROP POLICY IF EXISTS "customs_rules_admin_write"          ON customs_rules;

CREATE POLICY "customs_rules_select_authenticated"
  ON customs_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "customs_rules_admin_write"
  ON customs_rules FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- 5. DENEGAR ACCESO ANÓNIMO (anon key) a todas las tablas
--    Los usuarios no autenticados no pueden ni leer nada.
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles_deny_anon"      ON profiles;
CREATE POLICY "profiles_deny_anon"
  ON profiles FOR ALL TO anon USING (false);

-- simulations
DROP POLICY IF EXISTS "simulations_deny_anon"   ON simulations;
CREATE POLICY "simulations_deny_anon"
  ON simulations FOR ALL TO anon USING (false);

-- chat_history
DROP POLICY IF EXISTS "chat_history_deny_anon"  ON chat_history;
CREATE POLICY "chat_history_deny_anon"
  ON chat_history FOR ALL TO anon USING (false);

-- countries
DROP POLICY IF EXISTS "countries_deny_anon"     ON countries;
CREATE POLICY "countries_deny_anon"
  ON countries FOR ALL TO anon USING (false);

-- products
DROP POLICY IF EXISTS "products_deny_anon"      ON products;
CREATE POLICY "products_deny_anon"
  ON products FOR ALL TO anon USING (false);

-- customs_rules
DROP POLICY IF EXISTS "customs_rules_deny_anon" ON customs_rules;
CREATE POLICY "customs_rules_deny_anon"
  ON customs_rules FOR ALL TO anon USING (false);

-- ============================================================
-- 6. FUNCIÓN AUXILIAR — Promover un usuario a rol 'admin'
--    Ejecutar como superusuario en el Dashboard de Supabase:
--    SELECT set_admin_role('<user-uuid>');
-- ============================================================

CREATE OR REPLACE FUNCTION set_admin_role(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data =
    jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'
    )
  WHERE id = target_user_id;
END;
$$;

-- Revocar ejecución pública de esta función sensible
REVOKE EXECUTE ON FUNCTION set_admin_role(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION set_admin_role(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION set_admin_role(UUID) FROM authenticated;
-- Solo el rol 'service_role' (backend) o el superusuario pueden llamarla.
