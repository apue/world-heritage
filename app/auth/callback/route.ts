/**
 * OAuth Callback Route
 * Handles the redirect from Google OAuth after user authorization
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('[Auth Callback] Received request')
  console.log('[Auth Callback] Code present:', !!code)
  console.log('[Auth Callback] Next URL:', next)

  if (code) {
    const supabase = await createClient()

    console.log('[Auth Callback] Exchanging code for session...')

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code:', error.message)
      // Redirect to home with error parameter
      return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error.message)}`)
    }

    console.log('[Auth Callback] Session created successfully')

    // Redirect to the next URL (default to home)
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      console.log('[Auth Callback] Redirecting to:', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      console.log('[Auth Callback] Redirecting to:', `https://${forwardedHost}${next}`)
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      console.log('[Auth Callback] Redirecting to:', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.error('[Auth Callback] No code found in callback URL')
  // No code present, redirect to home
  return NextResponse.redirect(`${origin}/?auth_error=no_code`)
}
