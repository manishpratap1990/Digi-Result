import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Demo Mode: No Supabase configured ───────────────────────────────
  // When env vars are absent, pass requests through (dev/demo only).
  // In production, env vars MUST be set — without them all admin routes
  // remain accessible in demo mode, which is intentional for local dev.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isConfigured = supabaseUrl && supabaseAnonKey &&
    !supabaseUrl.includes('your_supabase_project_url') &&
    !supabaseUrl.includes('demo-placeholder')

  if (!isConfigured) {
    return NextResponse.next()
  }

  // ── Create Supabase client for session check ─────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // ── Protect all /admin/* routes except /admin/login ─────────────────
    // Unauthorized users are sent to the PUBLIC homepage, not the login page.
    // This prevents exposing the existence of the admin panel.
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.delete('redirected')
        return NextResponse.redirect(url)
      }
    }

    // ── Already-logged-in admin visiting login → dashboard ──────────────
    if (pathname === '/admin/login' && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }

  } catch {
    // Supabase auth error — redirect admin routes to homepage for safety
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
