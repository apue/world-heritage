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
import type { PropertyVisitProgress, UserSiteStatus, UserStats } from '@/lib/data/types'
import { getComponentCount } from '@/lib/services/components'
import { buildPropertyComponentId, isSyntheticPropertyComponent } from '@/lib/utils/component-ids'

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
  applyVisitProgress: (siteId: string, progress: PropertyVisitProgress) => void

  // Utilities
  getSiteStatus: (siteId: string) => UserSiteStatus
  refresh: () => Promise<void>
}

const DEFAULT_STATUS: UserSiteStatus = { visited: false, wishlist: false, bookmark: false }

export const UserSitesContext = createContext<UserSitesContextValue | null>(null)

function computeProgress(
  siteId: string,
  components: Set<string>,
  hasSyntheticVisit: boolean
): PropertyVisitProgress {
  const totalComponents = getComponentCount(siteId)
  const visitedComponents = components.size
  const isVisited = hasSyntheticVisit || visitedComponents > 0
  const progressValue =
    totalComponents > 0 ? visitedComponents / totalComponents : isVisited ? 1 : 0

  return {
    siteId,
    totalComponents,
    visitedComponents,
    progress: Math.min(1, progressValue),
    isVisited,
    visitedComponentIds: Array.from(components),
  }
}

export function UserSitesProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sitesStatus, setSitesStatus] = useState<Map<string, UserSiteStatus>>(new Map())
  const [stats, setStats] = useState<UserStats>({ visited: 0, wishlist: 0, bookmark: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const getSiteStatus = useCallback(
    (siteId: string): UserSiteStatus => {
      return sitesStatus.get(siteId) || DEFAULT_STATUS
    },
    [sitesStatus]
  )

  const applyVisitProgress = useCallback((siteId: string, progress: PropertyVisitProgress) => {
    let previouslyVisited = false

    setSitesStatus((prev) => {
      const next = new Map(prev)
      const previousStatus = prev.get(siteId) ?? DEFAULT_STATUS
      previouslyVisited = previousStatus.visited
      next.set(siteId, {
        ...previousStatus,
        visited: progress.isVisited,
        visitProgress: progress,
      })
      return next
    })

    setStats((prev) => {
      const delta = progress.isVisited && !previouslyVisited ? 1 : 0
      const negativeDelta = !progress.isVisited && previouslyVisited ? -1 : 0
      if (delta === 0 && negativeDelta === 0) {
        return prev
      }
      return {
        ...prev,
        visited: Math.max(0, prev.visited + delta + negativeDelta),
      }
    })
  }, [])

  const loadAllUserSites = useCallback(
    async (userId: string) => {
      try {
        console.log('[UserSitesContext] Loading all user sites for:', userId)

        const [visitsRes, wishlistRes, bookmarkRes] = await Promise.all([
          supabase
            .from('user_component_visits')
            .select('site_id, component_id')
            .eq('user_id', userId),
          supabase
            .from('user_wishlist')
            .select('site_id, scope_type, scope_id')
            .eq('user_id', userId),
          supabase
            .from('user_bookmarks')
            .select('site_id, scope_type, scope_id')
            .eq('user_id', userId),
        ])

        if (visitsRes.error) throw visitsRes.error
        if (wishlistRes.error) throw wishlistRes.error
        if (bookmarkRes.error) throw bookmarkRes.error

        const visitAccumulator = new Map<
          string,
          { components: Set<string>; hasSyntheticVisit: boolean }
        >()

        for (const row of visitsRes.data || []) {
          const siteId = row.site_id
          const componentId = row.component_id
          const entry = visitAccumulator.get(siteId) || {
            components: new Set<string>(),
            hasSyntheticVisit: false,
          }

          if (isSyntheticPropertyComponent(componentId)) {
            entry.hasSyntheticVisit = true
          } else {
            entry.components.add(componentId)
          }

          visitAccumulator.set(siteId, entry)
        }

        const wishlistSet = new Set<string>()
        for (const row of wishlistRes.data || []) {
          if (row.scope_type === 'property') {
            wishlistSet.add(row.scope_id)
          }
        }

        const bookmarkSet = new Set<string>()
        for (const row of bookmarkRes.data || []) {
          if (row.scope_type === 'property') {
            bookmarkSet.add(row.scope_id)
          }
        }

        const statusMap = new Map<string, UserSiteStatus>()
        const visitedSiteIds = new Set<string>()
        const allSiteIds = new Set<string>([
          ...visitAccumulator.keys(),
          ...wishlistSet,
          ...bookmarkSet,
        ])

        for (const siteId of allSiteIds) {
          const accumulator = visitAccumulator.get(siteId) || {
            components: new Set<string>(),
            hasSyntheticVisit: false,
          }
          const progress = computeProgress(
            siteId,
            accumulator.components,
            accumulator.hasSyntheticVisit
          )

          if (progress.isVisited) {
            visitedSiteIds.add(siteId)
          }

          statusMap.set(siteId, {
            visited: progress.isVisited,
            visitProgress: progress,
            wishlist: wishlistSet.has(siteId),
            bookmark: bookmarkSet.has(siteId),
          })
        }

        setSitesStatus(statusMap)
        setStats({
          visited: visitedSiteIds.size,
          wishlist: wishlistSet.size,
          bookmark: bookmarkSet.size,
        })

        console.log('[UserSitesContext] Loaded:', {
          visited: visitedSiteIds.size,
          wishlist: wishlistSet.size,
          bookmark: bookmarkSet.size,
        })
      } catch (error) {
        console.error('[UserSitesContext] Failed to load user sites:', error)
      }
    },
    [supabase]
  )

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[UserSitesContext] Auth state changed:', event)
      const newUser = session?.user ?? null
      setUser(newUser)

      if (newUser) {
        loadAllUserSites(newUser.id)
      } else {
        setSitesStatus(new Map())
        setStats({ visited: 0, wishlist: 0, bookmark: 0 })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, loadAllUserSites])

  const toggleVisited = async (siteId: string): Promise<boolean> => {
    if (!user) {
      console.warn('[UserSitesContext] User not logged in')
      return false
    }

    const currentStatus = getSiteStatus(siteId)
    const newValue = !currentStatus.visited

    const originalStatus = { ...currentStatus }
    const originalStats = { ...stats }

    try {
      const optimisticProgress: PropertyVisitProgress | undefined = currentStatus.visitProgress
        ? {
            ...currentStatus.visitProgress,
            isVisited: newValue,
            progress: newValue
              ? currentStatus.visitProgress.totalComponents > 0
                ? Math.min(
                    1,
                    currentStatus.visitProgress.visitedComponents /
                      currentStatus.visitProgress.totalComponents
                  )
                : 1
              : 0,
          }
        : undefined

      const optimisticStatus: UserSiteStatus = {
        ...currentStatus,
        visited: newValue,
        visitProgress: optimisticProgress,
        wishlist: newValue ? false : currentStatus.wishlist,
      }

      setSitesStatus((prev) => new Map(prev).set(siteId, optimisticStatus))
      setStats((prev) => ({
        ...prev,
        visited: prev.visited + (newValue ? 1 : -1),
        wishlist: newValue && currentStatus.wishlist ? prev.wishlist - 1 : prev.wishlist,
      }))

      const endpoint = '/api/user/visits/components'
      const requestInit: RequestInit = {
        method: newValue ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          newValue
            ? { scope: 'property', siteId }
            : { componentId: buildPropertyComponentId(siteId), siteId }
        ),
      }

      const response = await fetch(endpoint, requestInit)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const { progress } = (await response.json()) as { progress: PropertyVisitProgress }

      applyVisitProgress(siteId, progress)

      if (newValue && currentStatus.wishlist) {
        await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('scope_type', 'property')
          .eq('scope_id', siteId)
      }

      console.log('[UserSitesContext] Toggled visited:', siteId, newValue)
      return true
    } catch (error) {
      console.error('[UserSitesContext] Failed to toggle visited:', error)

      setSitesStatus((prev) => new Map(prev).set(siteId, originalStatus))
      setStats(originalStats)

      alert('Failed to update. Please check your connection and try again.')
      return false
    }
  }

  const toggleWishlist = async (siteId: string): Promise<boolean> => {
    if (!user) {
      console.warn('[UserSitesContext] User not logged in')
      return false
    }

    const currentStatus = getSiteStatus(siteId)
    const newValue = !currentStatus.wishlist

    const originalStatus = { ...currentStatus }
    const originalStats = { ...stats }

    try {
      const newStatus: UserSiteStatus = {
        ...currentStatus,
        wishlist: newValue,
      }

      setSitesStatus((prev) => new Map(prev).set(siteId, newStatus))
      setStats((prev) => ({
        ...prev,
        wishlist: prev.wishlist + (newValue ? 1 : -1),
      }))

      if (newValue) {
        const { error } = await supabase.from('user_wishlist').insert({
          user_id: user.id,
          site_id: siteId,
          scope_type: 'property',
          scope_id: siteId,
          priority: 'medium',
        })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('scope_type', 'property')
          .eq('scope_id', siteId)

        if (error) throw error
      }

      console.log('[UserSitesContext] Toggled wishlist:', siteId, newValue)
      return true
    } catch (error) {
      console.error('[UserSitesContext] Failed to toggle wishlist:', error)

      setSitesStatus((prev) => new Map(prev).set(siteId, originalStatus))
      setStats(originalStats)

      alert('Failed to update. Please check your connection and try again.')
      return false
    }
  }

  const toggleBookmark = async (siteId: string): Promise<boolean> => {
    if (!user) {
      console.warn('[UserSitesContext] User not logged in')
      return false
    }

    const currentStatus = getSiteStatus(siteId)
    const newValue = !currentStatus.bookmark

    const originalStatus = { ...currentStatus }
    const originalStats = { ...stats }

    try {
      const newStatus: UserSiteStatus = {
        ...currentStatus,
        bookmark: newValue,
      }

      setSitesStatus((prev) => new Map(prev).set(siteId, newStatus))
      setStats((prev) => ({
        ...prev,
        bookmark: prev.bookmark + (newValue ? 1 : -1),
      }))

      if (newValue) {
        const { error } = await supabase.from('user_bookmarks').insert({
          user_id: user.id,
          site_id: siteId,
          scope_type: 'property',
          scope_id: siteId,
        })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('scope_type', 'property')
          .eq('scope_id', siteId)

        if (error) throw error
      }

      console.log('[UserSitesContext] Toggled bookmark:', siteId, newValue)
      return true
    } catch (error) {
      console.error('[UserSitesContext] Failed to toggle bookmark:', error)

      setSitesStatus((prev) => new Map(prev).set(siteId, originalStatus))
      setStats(originalStats)

      alert('Failed to update. Please check your connection and try again.')
      return false
    }
  }

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
        applyVisitProgress,
        getSiteStatus,
        refresh,
      }}
    >
      {children}
    </UserSitesContext.Provider>
  )
}

export function useUserSites() {
  const context = useContext(UserSitesContext)
  if (!context) {
    throw new Error('useUserSites must be used within UserSitesProvider')
  }
  return context
}
