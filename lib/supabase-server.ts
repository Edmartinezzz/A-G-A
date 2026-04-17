/**
 * supabase-server.ts
 *
 * Cliente de Supabase para uso exclusivo en el servidor (Server Components,
 * Route Handlers, Middleware).  Usa la SERVICE_ROLE_KEY para operaciones
 * privilegiadas (p. ej. verificar el JWT del usuario) o la ANON_KEY para
 * operaciones sujetas a RLS.
 *
 * ⚠️  NUNCA importar este módulo desde código de cliente ('use client').
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ──────────────────────────────────────────────────────────────────────────────
// Variables de entorno
// ──────────────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabase-server] Faltan las variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Crea un cliente de Supabase para Servidor (SSR) con manejo automático de cookies.
 */
export async function createServerSideClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El método setAll puede fallar si se llama desde un Server Component
          }
        },
      },
    }
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Cliente privilegiado con SERVICE_ROLE KEY — NO sujeto a RLS
// Solo para operaciones de administración o verificación de tokens.
// ──────────────────────────────────────────────────────────────────────────────
export function createAdminSupabaseClient(): SupabaseClient {
  if (!supabaseServiceKey) {
    throw new Error(
      '[supabase-server] Falta la variable SUPABASE_SERVICE_ROLE_KEY para operaciones de admin'
    )
  }

  return createClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// Verificar un JWT de Supabase y devolver el usuario o null
// Usado principalmente en el middleware.
// ──────────────────────────────────────────────────────────────────────────────
export async function verifySupabaseToken(
  token: string
): Promise<{ id: string; email?: string; role?: string } | null> {
  try {
    // Usamos el admin client para llamar a getUser(), que valida el JWT
    // contra la clave secreta de Supabase Auth sin necesidad de una sesión
    // activa en el servidor.
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin.auth.getUser(token)

    if (error || !data.user) {
      return null
    }

    return {
      id: data.user.id,
      email: data.user.email,
      // El rol 'admin' se guarda en app_metadata para que RLS pueda leerlo
      role: (data.user.app_metadata?.role as string) ?? 'user',
    }
  } catch {
    return null
  }
}
