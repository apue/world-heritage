'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropertyVisitProgress } from '@/lib/data/types'
import { useUserSites } from '@/lib/contexts/UserSitesContext'
import { getComponentCount } from '@/lib/services/components'

interface ProgressState {
  progress: PropertyVisitProgress
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  markComponent: (componentId: string) => Promise<boolean>
  unmarkComponent: (componentId: string) => Promise<boolean>
}

function createFallbackProgress(siteId: string): PropertyVisitProgress {
  const totalComponents = getComponentCount(siteId)
  return {
    siteId,
    totalComponents,
    visitedComponents: 0,
    progress: 0,
    isVisited: false,
    visitedComponentIds: [],
  }
}

export function useComponentProgress(siteId: string): ProgressState {
  const { user, getSiteStatus, applyVisitProgress } = useUserSites()
  const fallbackProgress = useMemo(() => createFallbackProgress(siteId), [siteId])
  const initialProgress = useMemo(
    () => getSiteStatus(siteId).visitProgress ?? fallbackProgress,
    [getSiteStatus, siteId, fallbackProgress]
  )

  const [progress, setProgress] = useState<PropertyVisitProgress>(initialProgress)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(user))
  const [error, setError] = useState<string | null>(null)

  const syncProgress = useCallback(
    (next: PropertyVisitProgress) => {
      setProgress(next)
      applyVisitProgress(siteId, next)
    },
    [applyVisitProgress, siteId]
  )

  const fetchProgress = useCallback(async () => {
    if (!user) {
      syncProgress(fallbackProgress)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/visits/progress/${siteId}`)
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`)
      }
      const { progress: serverProgress } = (await response.json()) as {
        progress: PropertyVisitProgress
      }
      syncProgress(serverProgress)
    } catch (err) {
      console.error('[useComponentProgress] Failed to load progress', err)
      setError('Failed to load progress')
      syncProgress(fallbackProgress)
    } finally {
      setIsLoading(false)
    }
  }, [user, siteId, syncProgress, fallbackProgress])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const optimisticUpdate = useCallback(
    (componentId: string, shouldAdd: boolean) => {
      setProgress((prev) => {
        const visitedSet = new Set(prev.visitedComponentIds)
        if (shouldAdd) {
          visitedSet.add(componentId)
        } else {
          visitedSet.delete(componentId)
        }

        const visitedArray = Array.from(visitedSet)
        const visitedComponents = visitedArray.length
        const totalComponents = prev.totalComponents
        const isVisited = visitedComponents > 0
        const progressValue =
          totalComponents > 0 ? visitedComponents / totalComponents : isVisited ? 1 : 0

        const nextProgress: PropertyVisitProgress = {
          ...prev,
          visitedComponentIds: visitedArray,
          visitedComponents,
          progress: Math.min(1, progressValue),
          isVisited,
        }

        applyVisitProgress(siteId, nextProgress)
        return nextProgress
      })
    },
    [applyVisitProgress, siteId]
  )

  const revertProgress = useCallback(
    (previous: PropertyVisitProgress) => {
      setProgress(previous)
      applyVisitProgress(siteId, previous)
    },
    [applyVisitProgress, siteId]
  )

  const markComponent = useCallback(
    async (componentId: string) => {
      if (!user) {
        setError('auth')
        return false
      }

      const previous = progress
      optimisticUpdate(componentId, true)

      try {
        const response = await fetch('/api/user/visits/components', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ componentId, siteId }),
        })

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const { progress: serverProgress } = (await response.json()) as {
          progress: PropertyVisitProgress
        }
        syncProgress(serverProgress)
        return true
      } catch (err) {
        console.error('[useComponentProgress] Failed to mark component', err)
        revertProgress(previous)
        setError('Failed to update component visit')
        return false
      }
    },
    [optimisticUpdate, progress, revertProgress, siteId, syncProgress, user]
  )

  const unmarkComponent = useCallback(
    async (componentId: string) => {
      if (!user) {
        setError('auth')
        return false
      }

      const previous = progress
      optimisticUpdate(componentId, false)

      try {
        const response = await fetch('/api/user/visits/components', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ componentId, siteId }),
        })

        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const { progress: serverProgress } = (await response.json()) as {
          progress: PropertyVisitProgress
        }
        syncProgress(serverProgress)
        return true
      } catch (err) {
        console.error('[useComponentProgress] Failed to unmark component', err)
        revertProgress(previous)
        setError('Failed to update component visit')
        return false
      }
    },
    [optimisticUpdate, progress, revertProgress, siteId, syncProgress, user]
  )

  return {
    progress,
    isLoading,
    error,
    refresh: fetchProgress,
    markComponent,
    unmarkComponent,
  }
}
