'use client'

/**
 * Sidebar component for explore page
 * Contains search, filters, and results list
 */

import { useState } from 'react'
import { HeritageSite, SiteFilters } from '@/lib/data/types'
import { Locale } from '@/lib/i18n/config'

interface ExploreSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: SiteFilters
  onFiltersChange: (filters: SiteFilters) => void
  results: HeritageSite[]
  totalCount: number
  onSiteSelect: (site: HeritageSite) => void
  selectedSite: HeritageSite | null
  availableCountries: Array<{ code: string; count: number }> // Reserved for future country filter
  locale: Locale
}

export default function ExploreSidebar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  results,
  totalCount,
  onSiteSelect,
  selectedSite,
  availableCountries: _availableCountries, // Reserved for future use
  locale,
}: ExploreSidebarProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true)

  // Translations
  const t = {
    en: {
      search: 'Search heritage sites...',
      filters: 'Filters',
      category: 'Category',
      country: 'Country',
      year: 'Inscription Year',
      status: 'Status',
      cultural: 'Cultural',
      natural: 'Natural',
      mixed: 'Mixed',
      transboundary: 'Transboundary',
      danger: 'In Danger',
      showing: 'Showing',
      of: 'of',
      sites: 'sites',
      clearFilters: 'Clear Filters',
      noResults: 'No sites found',
      tryDifferent: 'Try adjusting your search or filters',
    },
    zh: {
      search: '搜索世界遗产...',
      filters: '筛选',
      category: '类型',
      country: '国家',
      year: '入选年份',
      status: '状态',
      cultural: '文化遗产',
      natural: '自然遗产',
      mixed: '混合遗产',
      transboundary: '跨境遗产',
      danger: '濒危遗产',
      showing: '显示',
      of: '/',
      sites: '个遗产地',
      clearFilters: '清除筛选',
      noResults: '未找到遗产地',
      tryDifferent: '请尝试调整搜索关键词或筛选条件',
    },
  }[locale]

  const hasActiveFilters =
    (filters.categories && filters.categories.length > 0) ||
    (filters.countries && filters.countries.length > 0) ||
    filters.transboundary !== undefined ||
    filters.danger !== undefined ||
    (filters.yearRange && (filters.yearRange.min || filters.yearRange.max))

  const handleClearFilters = () => {
    onFiltersChange({})
    onSearchChange('')
  }

  const handleCategoryToggle = (category: 'Cultural' | 'Natural' | 'Mixed') => {
    const current = filters.categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    onFiltersChange({ ...filters, categories: updated.length > 0 ? updated : undefined })
  }

  const handleStatusToggle = (status: 'transboundary' | 'danger') => {
    if (status === 'transboundary') {
      onFiltersChange({
        ...filters,
        transboundary: filters.transboundary === true ? undefined : true,
      })
    } else {
      onFiltersChange({
        ...filters,
        danger: filters.danger === true ? undefined : true,
      })
    }
  }

  return (
    <div className="w-[360px] h-full bg-white shadow-lg flex flex-col border-r border-gray-200">
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">World Heritage</h1>
        <p className="text-sm text-gray-600 mt-1">
          {t.showing} {results.length} {t.of} {totalCount} {t.sites}
        </p>
      </div>

      {/* Search Box */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.search}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filters Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900">{t.filters}</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isFiltersExpanded && (
          <div className="p-4 space-y-4 bg-gray-50">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
              <div className="space-y-2">
                {(['Cultural', 'Natural', 'Mixed'] as const).map((category) => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category) || false}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {t[category.toLowerCase() as 'cultural' | 'natural' | 'mixed']}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.status}</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.transboundary === true}
                    onChange={() => handleStatusToggle('transboundary')}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.transboundary}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.danger === true}
                    onChange={() => handleStatusToggle('danger')}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t.danger}</span>
                </label>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">{t.noResults}</p>
            <p className="text-sm mt-2">{t.tryDifferent}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {results.map((site) => {
              const translation = site.translations[locale]
              const isSelected = selectedSite?.id === site.id

              return (
                <button
                  key={site.id}
                  onClick={() => onSiteSelect(site)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                    {translation.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">{translation.states}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded ${
                        site.category === 'Cultural'
                          ? 'bg-purple-100 text-purple-800'
                          : site.category === 'Natural'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {t[site.category.toLowerCase() as 'cultural' | 'natural' | 'mixed']}
                    </span>
                    {site.danger && (
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">
                        ⚠️
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
