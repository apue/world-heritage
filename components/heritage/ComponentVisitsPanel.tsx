'use client'

import { useCallback } from 'react'
import type { ComponentSite } from '@/lib/data/types'
import type { Locale } from '@/lib/i18n/config'
import { useComponentProgress } from '@/lib/hooks/useComponentProgress'
import { useUserSites } from '@/lib/contexts/UserSitesContext'
import VisitProgress from '@/components/heritage/VisitProgress'
import ComponentList from '@/components/heritage/ComponentList'

interface ComponentVisitsPanelProps {
  siteId: string
  components: ComponentSite[]
  locale: Locale
}

export default function ComponentVisitsPanel({
  siteId,
  components,
  locale,
}: ComponentVisitsPanelProps) {
  const { user } = useUserSites()
  const { progress, isLoading, error, markComponent, unmarkComponent } =
    useComponentProgress(siteId)

  const handleToggle = useCallback(
    async (componentId: string, shouldVisit: boolean) => {
      if (shouldVisit) {
        return markComponent(componentId)
      }
      return unmarkComponent(componentId)
    },
    [markComponent, unmarkComponent]
  )

  return (
    <div className="space-y-6">
      <VisitProgress
        progress={progress}
        isLoading={isLoading}
        locale={locale}
        isSignedIn={Boolean(user)}
      />
      <ComponentList
        components={components}
        visitedComponentIds={progress.visitedComponentIds}
        locale={locale}
        isSignedIn={Boolean(user)}
        isLoading={isLoading}
        onToggle={handleToggle}
      />
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
