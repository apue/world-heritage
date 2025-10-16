'use client'

/**
 * UserSitesContext - Global state management for user site interactions
 *
 * Features:
 * - Batch loading of all user sites (3 queries total, not N queries)
 * - O(1) lookup using Map data structure
 * - Optimistic updates with automatic rollback on error
 * - Real-time statistics tracking
 * - Automatic sync with authentication state
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserSiteStatus, UserStats } from '@/lib/data/types'

interface UserSitesContextValue {
  // State
  sitesStatus: Map<string, UserSiteStatus>
  stats: UserStats
  isLoading: boolean
  user: User | null

  // Actions (with optimistic updates + error rollback)
  toggleVisited: (siteId: string) => Promise<boolean>
  toggleWishlist: (siteId: string) => Promise<boolean>
  toggleBookmark: (siteId: string) => Promise<boolean>

  // Utilities
  getSiteStatus: (siteId: string) => UserSiteStatus
  refresh: () => Promise<void>
}

const UserSitesContext = createContext<UserSitesContextValue | null>(null)

export function UserSitesProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sitesStatus, setSitesStatus] = useState<Map<string, UserSiteStatus>>(new Map())
  const [stats, setStats] = useState<UserStats>({ visited: 0, wishlist: 0, bookmark: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  /**
   * Load all user sites in one batch (3 queries total)
   */
  const loadAllUserSites = useCallback(
    async (userId: string) => {
      try {
        console.log('[UserSitesContext] Loading all user sites for:', userId)

        // Parallel queries for all 3 tables
        const [visitedRes, wishlistRes, bookmarkRes] = await Promise.all([
          supabase.from('user_visits').select('site_id').eq('user_id', userId),
          supabase.from('user_wishlist').select('site_id').eq('user_id', userId),
          supabase.from('user_bookmarks').select('site_id').eq('user_id', userId),
        ])

        // Build Sets for O(1) lookup
        const visitedSet = new Set(visitedRes.data?.map((v) => v.site_id) || [])
        const wishlistSet = new Set(wishlistRes.data?.map((w) => w.site_id) || [])
        const bookmarkSet = new Set(bookmarkRes.data?.map((b) => b.site_id) || [])

        // Merge all site IDs
        const allSiteIds = new Set([...visitedSet, ...wishlistSet, ...bookmarkSet])

        // Build Map with status for each site
        const statusMap = new Map<string, UserSiteStatus>()
        allSiteIds.forEach((siteId) => {
          statusMap.set(siteId, {
            visited: visitedSet.has(siteId),
            wishlist: wishlistSet.has(siteId),
            bookmark: bookmarkSet.has(siteId),
          })
        })

        setSitesStatus(statusMap)
        setStats({
          visited: visitedSet.size,
          wishlist: wishlistSet.size,
          bookmark: bookmarkSet.size,
        })

        console.log('[UserSitesContext] Loaded:', {
          visited: visitedSet.size,
          wishlist: wishlistSet.size,
          bookmark: bookmarkSet.size,
        })
      } catch (error) {
        console.error('[UserSitesContext] Failed to load user sites:', error)
      }
    },
    [supabase]
  )

  /**
   * Initialize: Get user and load their sites
   */
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await loadAllUserSites(user.id)
      }

      setIsLoading(false)
    }

    init()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[UserSitesContext] Auth state changed:', event)
      const newUser = session?.user ?? null
      setUser(newUser)

      if (newUser) {
        loadAllUserSites(newUser.id)
      } else {
        // User logged out - clear all state
        setSitesStatus(new Map())
        setStats({ visited: 0, wishlist: 0, bookmark: 0 })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadAllUserSites])

  /**
   * Get status for a single site (O(1) lookup)
   */
  const getSiteStatus = useCallback(
    (siteId: string): UserSiteStatus => {
      return sitesStatus.get(siteId) || { visited: false, wishlist: false, bookmark: false }
    },
    [sitesStatus]
  )

  /**
   * Toggle visited status with optimistic update + rollback on error
   * Auto-removes from wishlist when marking as visited (business rule)
   */
  const toggleVisited = async (siteId: string): Promise<boolean> => {
    if (!user) {
      console.warn('[UserSitesContext] User not logged in')
      return false
    }

    const currentStatus = getSiteStatus(siteId)
    const newValue = !currentStatus.visited

    // Store original state for rollback
    const originalStatus = { ...currentStatus }
    const originalStats = { ...stats }

    try {
      // 1. Optimistic UI update (immediate response)
      const newStatus: UserSiteStatus = {
        ...currentStatus,
        visited: newValue,
        // Business rule: visited + wishlist are mutually exclusive
        wishlist: newValue ? false : currentStatus.wishlist,
      }

      setSitesStatus((prev) => new Map(prev).set(siteId, newStatus))
      setStats((prev) => ({
        ...prev,
        visited: prev.visited + (newValue ? 1 : -1),
        wishlist: newValue && currentStatus.wishlist ? prev.wishlist - 1 : prev.wishlist,
      }))

      // 2. Update database
      if (newValue) {
        // Add to visited
        const { error: insertError } = await supabase.from('user_visits').insert({
          user_id: user.id,
          site_id: siteId,
          visit_date: new Date().toISOString().split('T')[0],
        })

        if (insertError) throw insertError

        // Remove from wishlist (if exists)
        if (currentStatus.wishlist) {
          await supabase.from('user_wishlist').delete().eq('user_id', user.id).eq('site_id', siteId)
        }
      } else {
        // Remove from visited
        const { error: deleteError } = await supabase
          .from('user_visits')
          .delete()
          .eq('user_id', user.id)
          .eq('site_id', siteId)

        if (deleteError) throw deleteError
      }

      console.log('[UserSitesContext] Toggled visited:', siteId, newValue)
      return true
    } catch (error) {
      console.error('[UserSitesContext] Failed to toggle visited:', error)

      // 3. Rollback on error
      setSitesStatus((prev) => new Map(prev).set(siteId, originalStatus))
      setStats(originalStats)

      // 4. Notify user
      alert('Failed to update. Please check your connection and try again.')
      return false
    }
  }

  /**
   * Toggle wishlist status with optimistic update + rollback on error
   */
  const toggleWishlist = async (siteId: string): Promise<boolean> => {
    if (!user) {
      console.warn('[UserSitesContext] User not logged in')
      return false
    }

    const currentStatus = getSiteStatus(siteId)
    const newValue = !currentStatus.wishlist

    // Store original state for rollback
    const originalStatus = { ...currentStatus }
    const originalStats = { ...stats }

    try {
      // 1. Optimistic UI update
      const newStatus: UserSiteStatus = {
        ...currentStatus,
        wishlist: newValue,
      }

      setSitesStatus((prev) => new Map(prev).set(siteId, newStatus))
      setStats((prev) => ({
        ...prev,
        wishlist: prev.wishlist + (newValue ? 1 : -1),
      }))

      // 2. Update database
      if (newValue) {
        const { error } = await supabase.from('user_wishlist').insert({
          user_id: user.id,
          site_id: siteId,
          priority: 'medium',
        })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('site_id', siteId)

        if (error) throw error
      }

      console.log('[UserSitesContext] Toggled wishlist:', siteId, newValue)
      return true
    } catch (error) {
      console.error('[UserSitesContext] Failed to toggle wishlist:', error)

      // 3. Rollback on error
      setSitesStatus((prev) => new Map(prev).set(siteId, originalStatus))
      setStats(originalStats)

      alert('Failed to update. Please check your connection and try again.')
      return false
    }
  }

  /**
   * Toggle bookmark status with optimistic update + rollback on error
   */
  const toggleBookmark = async (siteId: string): Promise<boolean> => {
    if (!user) {
      console.warn('[UserSitesContext] User not logged in')
      return false
    }

    const currentStatus = getSiteStatus(siteId)
    const newValue = !currentStatus.bookmark

    // Store original state for rollback
    const originalStatus = { ...currentStatus }
    const originalStats = { ...stats }

    try {
      // 1. Optimistic UI update
      const newStatus: UserSiteStatus = {
        ...currentStatus,
        bookmark: newValue,
      }

      setSitesStatus((prev) => new Map(prev).set(siteId, newStatus))
      setStats((prev) => ({
        ...prev,
        bookmark: prev.bookmark + (newValue ? 1 : -1),
      }))

      // 2. Update database
      if (newValue) {
        const { error } = await supabase.from('user_bookmarks').insert({
          user_id: user.id,
          site_id: siteId,
        })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('site_id', siteId)

        if (error) throw error
      }

      console.log('[UserSitesContext] Toggled bookmark:', siteId, newValue)
      return true
    } catch (error) {
      console.error('[UserSitesContext] Failed to toggle bookmark:', error)

      // 3. Rollback on error
      setSitesStatus((prev) => new Map(prev).set(siteId, originalStatus))
      setStats(originalStats)

      alert('Failed to update. Please check your connection and try again.')
      return false
    }
  }

  /**
   * Manually refresh all data
   */
  const refresh = async () => {
    if (user) {
      await loadAllUserSites(user.id)
    }
  }

  return (
    <UserSitesContext.Provider
      value={{
        sitesStatus,
        stats,
        isLoading,
        user,
        toggleVisited,
        toggleWishlist,
        toggleBookmark,
        getSiteStatus,
        refresh,
      }}
    >
      {children}
    </UserSitesContext.Provider>
  )
}

/**
 * Hook to access user sites context
 * Must be used within UserSitesProvider
 */
export function useUserSites() {
  const context = useContext(UserSitesContext)
  if (!context) {
    throw new Error('useUserSites must be used within UserSitesProvider')
  }
  return context
}
