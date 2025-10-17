'use client'

/**
 * PropertyCard - Displays property-level information for World Heritage Sites
 * Clearly distinguishes the property from its component sites
 */

import type { HeritageSite } from '@/lib/data/types'
import type { Locale } from '@/lib/i18n/config'
import SiteActionButtons from './SiteActionButtons'

interface PropertyCardProps {
  site: HeritageSite
  locale: Locale
}

const labels: Record<Locale, { heading: string; serialBadge: string; coordinates: string }> = {
  en: {
    heading: 'This World Heritage Site',
    serialBadge: 'Serial property with',
    coordinates: 'Coordinates',
  },
  zh: {
    heading: '本世界遗产地',
    serialBadge: '串联遗产，包含',
    coordinates: '坐标',
  },
}

export default function PropertyCard({ site, locale }: PropertyCardProps) {
  const copy = labels[locale]
  const translation = site.translations[locale] ?? site.translations.en
  const hasComponents = site.hasComponents && site.components && site.components.length > 0
  const componentCount = site.componentCount || 0

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Heading */}
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">{copy.heading}</h2>
          </div>

          {/* Property Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{translation.name}</h3>

          {/* Coordinates */}
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-mono">
              {site.latitude.toFixed(4)}°N, {site.longitude.toFixed(4)}°E
            </span>
          </p>

          {/* Serial Property Badge */}
          {hasComponents && (
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm border border-blue-200">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span className="font-medium text-gray-700">
                {copy.serialBadge}{' '}
                <strong className="text-blue-700">
                  {componentCount} {locale === 'en' ? 'component sites' : '个组成部分'}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Property-level Actions */}
        <div className="flex-shrink-0">
          <SiteActionButtons siteId={site.id} variant="detail" locale={locale} />
        </div>
      </div>
    </div>
  )
}
