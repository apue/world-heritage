/**
 * Supabase Client for Client Components
 * Use this in 'use client' components (browser environment)
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validation with logging
  if (!supabaseUrl) {
    console.error('[Supabase Client] Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    console.error('[Supabase Client] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  console.log('[Supabase Client] Creating browser client')

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
