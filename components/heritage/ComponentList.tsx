'use client'

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
  }
> = {
  en: {
    title: 'Component sites',
    empty: 'No component data available yet.',
    actionVisit: 'Mark as visited',
    actionVisited: 'Visited',
    signIn: 'Sign in to track visits',
  },
  zh: {
    title: '组成遗产列表',
    empty: '暂未找到组成部分数据。',
    actionVisit: '标记已访问',
    actionVisited: '已访问',
    signIn: '登录后可记录访问情况',
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
  const visitedSet = useMemo(() => new Set(visitedComponentIds), [visitedComponentIds])

  const sortedComponents = useMemo(() => {
    return [...components].sort((a, b) =>
      getLocalizedName(a, locale).localeCompare(getLocalizedName(b, locale))
    )
  }, [components, locale])

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{copy.title}</h3>

      {!isSignedIn && <p className="mt-2 text-sm text-gray-500">{copy.signIn}</p>}

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : sortedComponents.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">{copy.empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sortedComponents.map((component) => {
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
                }`}
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
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>{component.componentId}</span>
                    <span>
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
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition ${
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
      )}
    </section>
  )
}
