import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // Check if Supabase is configured
  const isConfigured = supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
    supabaseUrl.startsWith('http')

  const url = req.nextUrl.clone()

  // If Supabase is not configured, allow all routes except dashboard
  if (!isConfigured) {
    if (url.pathname.startsWith('/dashboard')) {
      url.pathname = '/auth/login'
      url.searchParams.set('error', 'supabase_not_configured')
      return NextResponse.redirect(url)
    }
    return res
  }

  // Create Supabase client for middleware
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })

  // Get session from cookies
  const token = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value

  let session = null
  
  if (token && refreshToken) {
    const { data: { session: userSession } } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken
    })
    session = userSession
  }

  // Protect /dashboard/* routes
  if (url.pathname.startsWith('/dashboard')) {
    // If no session, redirect to login
    if (!session) {
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Get user profile to check user type
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      // If profile doesn't exist, redirect to login
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Redirect based on user type
    if (profile.user_type === 'student') {
      // Students should only access /dashboard/student/*
      if (!url.pathname.startsWith('/dashboard/student')) {
        url.pathname = '/dashboard/student'
        return NextResponse.redirect(url)
      }
    } else if (profile.user_type === 'admin') {
      // Admins should only access /dashboard/admin/*
      if (!url.pathname.startsWith('/dashboard/admin')) {
        url.pathname = '/dashboard/admin'
        return NextResponse.redirect(url)
      }
    }
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (session && (url.pathname.startsWith('/auth/login') || url.pathname.startsWith('/auth/signup'))) {
    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      url.pathname = profile.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/student'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
