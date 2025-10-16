'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Initiate Google OAuth sign-in via Supabase.
 * Caller handles UI state and error presentation.
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient()

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (error) {
    throw error
  }
}


