import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 🚨 THE FIX: getUser() ki jagah getSession() use kiya. 
  // Yeh fast hai aur Vercel par timeout nahi hota.
  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isAuthPage = path === '/login' || path === '/signup'

  // Agar user dashboard par bina session ke aaya toh login par bhejo
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Agar user login/signup par hai aur session hai toh dashboard bhejo
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
