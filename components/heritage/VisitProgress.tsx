'use client'

import { useMemo } from 'react'
import type { PropertyVisitProgress } from '@/lib/data/types'
import type { Locale } from '@/lib/i18n/config'

interface VisitProgressProps {
  progress: PropertyVisitProgress
  isLoading: boolean
  locale: Locale
  isSignedIn: boolean
}

const labels: Record<
  Locale,
  {
    title: string
    subtitle: (visited: number, total: number) => string
    signIn: string
    loading: string
  }
> = {
  en: {
    title: 'Visit progress',
    subtitle: (visited, total) => `Visited ${visited} of ${total} components`,
    signIn: 'Sign in to track your visits',
    loading: 'Loading progress…',
  },
  zh: {
    title: '访问进度',
    subtitle: (visited, total) => `已访问 ${visited} / ${total} 个组成部分`,
    signIn: '登录后可记录访问进度',
    loading: '正在加载进度…',
  },
}

export default function VisitProgress({
  progress,
  isLoading,
  locale,
  isSignedIn,
}: VisitProgressProps) {
  const copy = labels[locale]
  const percentage = useMemo(() => Math.round(progress.progress * 100), [progress])

  if (progress.totalComponents === 0) {
    return null
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{copy.title}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {isLoading
              ? copy.loading
              : copy.subtitle(progress.visitedComponents, progress.totalComponents)}
          </p>
        </div>
        <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-gray-200" aria-hidden="true">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {!isSignedIn && <p className="mt-4 text-sm text-gray-500">{copy.signIn}</p>}
    </section>
  )
}
