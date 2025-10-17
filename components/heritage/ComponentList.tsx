'use client'

/**
 * ComponentList - Enhanced component sites list with Variant A styling
 * Features: Progress bar, collapsible, max-height scrolling, pagination
 */

import { useMemo, useState } from 'react'
import type { ComponentSite } from '@/lib/data/types'
import type { Locale } from '@/lib/i18n/config'

interface ComponentListProps {
  components: ComponentSite[]
  visitedComponentIds: string[]
  locale: Locale
  isSignedIn: boolean
  isLoading: boolean
  onToggle: (componentId: string, shouldVisit: boolean) => Promise<boolean>
  onSelectComponent?: (componentId: string) => void
  selectedComponentId?: string | null
}

const labels: Record<
  Locale,
  {
    title: string
    empty: string
    actionVisit: string
    actionVisited: string
    signIn: string
    progress: string
    visited: string
    collapse: string
    expand: string
    showing: string
    of: string
    showAll: string
  }
> = {
  en: {
    title: 'Component Sites',
    empty: 'No component data available yet.',
    actionVisit: 'Mark as visited',
    actionVisited: 'Visited',
    signIn: 'Sign in to track visits',
    progress: 'Your progress',
    visited: 'visited',
    collapse: 'Collapse',
    expand: 'Expand',
    showing: 'Showing',
    of: 'of',
    showAll: 'Show all',
  },
  zh: {
    title: '组成遗产',
    empty: '暂未找到组成部分数据。',
    actionVisit: '标记已访问',
    actionVisited: '已访问',
    signIn: '登录后可记录访问情况',
    progress: '访问进度',
    visited: '已访问',
    collapse: '收起',
    expand: '展开',
    showing: '显示',
    of: '共',
    showAll: '显示全部',
  },
}

function getLocalizedName(component: ComponentSite, locale: Locale) {
  return (
    component.name[locale] ??
    component.name.en ??
    Object.values(component.name)[0] ??
    component.componentId
  )
}

export default function ComponentList({
  components,
  visitedComponentIds,
  locale,
  isSignedIn,
  isLoading,
  onToggle,
  onSelectComponent,
  selectedComponentId,
}: ComponentListProps) {
  const copy = labels[locale]
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const visitedSet = useMemo(() => new Set(visitedComponentIds), [visitedComponentIds])

  const sortedComponents = useMemo(() => {
    return [...components].sort((a, b) =>
      getLocalizedName(a, locale).localeCompare(getLocalizedName(b, locale))
    )
  }, [components, locale])

  // Calculate progress
  const totalComponents = components.length
  const visitedCount = visitedComponentIds.length
  const progressPercentage = totalComponents > 0 ? (visitedCount / totalComponents) * 100 : 0

  // Pagination logic
  const INITIAL_DISPLAY_COUNT = 10
  const displayedComponents = showAll
    ? sortedComponents
    : sortedComponents.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = sortedComponents.length > INITIAL_DISPLAY_COUNT

  if (isLoading) {
    return (
      <section className="rounded-lg bg-white shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      </section>
    )
  }

  if (sortedComponents.length === 0) {
    return (
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">{copy.title}</h3>
        <p className="mt-4 text-sm text-gray-500">{copy.empty}</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">{copy.title}</h3>
            <span className="text-sm text-gray-500">({totalComponents})</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>{isCollapsed ? copy.expand : copy.collapse}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {isSignedIn && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{copy.progress}</span>
              <span className="font-medium">
                {visitedCount} {copy.of} {totalComponents} {copy.visited} (
                {progressPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {!isSignedIn && <p className="mt-3 text-sm text-gray-500">{copy.signIn}</p>}
      </div>

      {/* Component List (Collapsible + Scrollable) */}
      {!isCollapsed && (
        <div className="p-6">
          {hasMore && !showAll && (
            <p className="text-sm text-gray-500 mb-4">
              {copy.showing} {INITIAL_DISPLAY_COUNT} {copy.of} {totalComponents} •{' '}
              <button
                onClick={() => setShowAll(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                {copy.showAll}
              </button>
            </p>
          )}

          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {displayedComponents.map((component) => {
              const isVisited = visitedSet.has(component.componentId)
              const isPending = pendingId === component.componentId
              const label = getLocalizedName(component, locale)
              const metadata: string[] = []
              if (typeof component.area === 'number' && component.area > 0) {
                metadata.push(`${component.area.toLocaleString()} ha`)
              }
              if (component.designation) {
                metadata.push(component.designation)
              }

              return (
                <li
                  key={component.componentId}
                  className={`flex items-center justify-between gap-4 rounded-lg border p-3 transition ${
                    selectedComponentId === component.componentId
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-200'
                  } ${onSelectComponent ? 'cursor-pointer' : ''}`}
                  onClick={() => onSelectComponent?.(component.componentId)}
                  role={onSelectComponent ? 'button' : undefined}
                  tabIndex={onSelectComponent ? 0 : -1}
                  onKeyDown={(event) => {
                    if (!onSelectComponent) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelectComponent(component.componentId)
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="font-mono">{component.componentId}</span>
                      <span className="font-mono">
                        {component.latitude.toFixed(3)}, {component.longitude.toFixed(3)}
                      </span>
                      {metadata.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async (event) => {
                      event.stopPropagation()
                      if (!isSignedIn || isPending) return
                      setPendingId(component.componentId)
                      const success = await onToggle(component.componentId, !isVisited)
                      if (!success) {
                        alert('Failed to update visit. Please try again.')
                      }
                      setPendingId(null)
                    }}
                    disabled={!isSignedIn || isPending}
                    className={`flex-shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition ${
                      isVisited
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${!isSignedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isPending ? (
                      <svg
                        className="mr-2 h-4 w-4 animate-spin text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : isVisited ? (
                      <svg
                        className="mr-2 h-4 w-4 text-emerald-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg
                        className="mr-2 h-4 w-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    )}
                    {isVisited ? copy.actionVisited : copy.actionVisit}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
