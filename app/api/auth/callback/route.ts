import { NextResponse } from "next/server"
import { createServerSideClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createServerSideClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_code_exchange_failed`)
}
