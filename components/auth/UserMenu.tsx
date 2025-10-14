'use client'

/**
 * User Menu Component
 * Shows login button when not authenticated
 * Shows user info and dropdown menu when authenticated
 */

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import LoginButton from './LoginButton'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)

      if (user) {
        console.log('[UserMenu] User logged in:', user.id)
      } else {
        console.log('[UserMenu] No user logged in')
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[UserMenu] Auth state changed:', event)
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      setIsMenuOpen(false)
      console.log('[UserMenu] Signing out...')

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[UserMenu] Sign out error:', error.message)
        alert(`Sign out failed: ${error.message}`)
        setIsSigningOut(false)
        return
      }

      console.log('[UserMenu] Sign out successful')
      // The auth state change listener will automatically update the UI
      // No need to manually setUser(null) as onAuthStateChange will handle it
    } catch (err) {
      console.error('[UserMenu] Unexpected error during sign out:', err)
      alert('An unexpected error occurred')
      setIsSigningOut(false)
    }
  }

  // Loading state
  if (isLoading || isSigningOut) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
  }

  // Not logged in - show login button
  if (!user) {
    return <LoginButton />
  }

  // Logged in - show user menu
  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
      >
        {user.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.full_name || user.email || 'User'}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="hidden md:inline">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop - closes menu when clicking outside */}
          <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>

          {/* Menu content */}
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* User info */}
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>My Profile</span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
