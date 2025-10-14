/**
 * Sign Out Route
 * Handles user sign out and session cleanup
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl

  console.log('[Auth Signout] Starting sign out process')

  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[Auth Signout] Error:', error.message)
    // Even if there's an error, redirect to home
  } else {
    console.log('[Auth Signout] Sign out successful')
  }

  // Redirect to home page
  return NextResponse.redirect(`${origin}/`, {
    status: 302,
  })
}
