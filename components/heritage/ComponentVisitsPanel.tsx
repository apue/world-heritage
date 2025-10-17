'use client'

import { useCallback, useState } from 'react'
import type { ComponentSite } from '@/lib/data/types'
import type { Locale } from '@/lib/i18n/config'
import { useComponentProgress } from '@/lib/hooks/useComponentProgress'
import { useUserSites } from '@/lib/contexts/UserSitesContext'
import VisitProgress from '@/components/heritage/VisitProgress'
import ComponentList from '@/components/heritage/ComponentList'
import ComponentMap from '@/components/map/ComponentMap'

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
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

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
      {components.length === 0 ? (
        <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {locale === 'zh'
            ? '该遗产暂未包含可视化的组成地数据。'
            : 'No component data available for this property yet.'}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <ComponentList
            components={components}
            visitedComponentIds={progress.visitedComponentIds}
            locale={locale}
            isSignedIn={Boolean(user)}
            isLoading={isLoading}
            onToggle={handleToggle}
            onSelectComponent={setSelectedComponentId}
            selectedComponentId={selectedComponentId}
          />
          <div className="space-y-3">
            <ComponentMap
              components={components}
              visitedComponentIds={progress.visitedComponentIds}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              locale={locale}
              className="h-96 rounded-lg border border-gray-200"
            />
            <p className="text-xs text-gray-500">
              {locale === 'zh'
                ? '点击列表或地图标记以查看组成地详情，已访问记录会显示为绿色。'
                : 'Select components via list or map markers; visited places appear in green.'}
            </p>
          </div>
        </div>
      )}
      {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
