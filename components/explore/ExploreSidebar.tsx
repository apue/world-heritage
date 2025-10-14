'use client'

/**
 * Sidebar component for the central hub
 * Contains search, advanced filters, stats, and results list
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { HeritageSite, SiteFilters } from '@/lib/data/types'
import { Locale } from '@/lib/i18n/config'
import { getCountryName, searchCountries } from '@/lib/data/countries'

interface ExploreSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: SiteFilters
  onFiltersChange: (filters: SiteFilters) => void
  results: HeritageSite[]
  totalCount: number
  onSiteSelect: (site: HeritageSite) => void
  selectedSite: HeritageSite | null
  availableCountries: Array<{ code: string; count: number }>
  statistics: {
    total: number
    byCategory: { Cultural: number; Natural: number; Mixed: number }
    transboundary: number
    danger: number
    yearRange: { min: number; max: number }
  }
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
  availableCountries,
  statistics,
  locale,
}: ExploreSidebarProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true)
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')

  // Translations
  const t = {
    en: {
      title: 'World Heritage Explorer',
      subtitle: 'Your gateway to UNESCO World Heritage',
      search: 'Search heritage sites...',
      filters: 'Filters',
      statistics: 'Statistics',
      category: 'Category',
      country: 'Country / Region',
      year: 'Inscription Year',
      region: 'Region',
      status: 'Status',
      cultural: 'Cultural',
      natural: 'Natural',
      mixed: 'Mixed',
      transboundary: 'Transboundary',
      danger: 'In Danger',
      showing: 'Showing',
      of: 'of',
      sites: 'sites',
      clearFilters: 'Clear All Filters',
      noResults: 'No sites found',
      tryDifferent: 'Try adjusting your search or filters',
      searchCountry: 'Search country...',
      selectCountries: 'Select countries',
      selectedCount: 'selected',
      yearRange: 'Year Range',
      totalSites: 'Total Sites',
      countries: 'countries',
      gamesTitle: 'Mini Games',
      geoChallenge: 'Geo Challenge',
      geoChallengeDesc: 'Test your geography knowledge',
      africaRegion: 'Africa',
      arabRegion: 'Arab States',
      asiaRegion: 'Asia & Pacific',
      europeRegion: 'Europe & North America',
      latinRegion: 'Latin America & Caribbean',
    },
    zh: {
      title: '世界遗产探索',
      subtitle: '联合国教科文组织世界遗产门户',
      search: '搜索世界遗产...',
      filters: '筛选',
      statistics: '统计',
      category: '类型',
      country: '国家/地区',
      year: '入选年份',
      region: '区域',
      status: '状态',
      cultural: '文化遗产',
      natural: '自然遗产',
      mixed: '混合遗产',
      transboundary: '跨境遗产',
      danger: '濒危遗产',
      showing: '显示',
      of: '/',
      sites: '个遗产地',
      clearFilters: '清除所有筛选',
      noResults: '未找到遗产地',
      tryDifferent: '请尝试调整搜索关键词或筛选条件',
      searchCountry: '搜索国家...',
      selectCountries: '选择国家',
      selectedCount: '已选',
      yearRange: '年份范围',
      totalSites: '总遗产地数',
      countries: '个国家',
      gamesTitle: '迷你游戏',
      geoChallenge: '地理挑战',
      geoChallengeDesc: '测试你的地理知识',
      africaRegion: '非洲',
      arabRegion: '阿拉伯国家',
      asiaRegion: '亚洲及太平洋',
      europeRegion: '欧洲及北美',
      latinRegion: '拉丁美洲及加勒比',
    },
  }[locale]

  // Region options
  const regionOptions = [
    { value: 'Africa', label: t.africaRegion },
    { value: 'Arab States', label: t.arabRegion },
    { value: 'Asia and the Pacific', label: t.asiaRegion },
    { value: 'Europe and North America', label: t.europeRegion },
    { value: 'Latin America and the Caribbean', label: t.latinRegion },
  ]

  // Filter and sort countries by name
  const filteredCountries = useMemo(() => {
    // Get all country codes with sites
    const countriesWithSites = new Set(availableCountries.map((c) => c.code))

    // Search countries by name
    const searchResults = searchCountries(countrySearch, locale)

    // Filter to only countries that have heritage sites
    const validCountries = searchResults.filter((code) => countriesWithSites.has(code))

    // Return with site counts
    return validCountries.map((code) => {
      const countryData = availableCountries.find((c) => c.code === code)
      return {
        code,
        name: getCountryName(code, locale),
        count: countryData?.count || 0,
      }
    })
  }, [availableCountries, countrySearch, locale])

  const hasActiveFilters =
    (filters.categories && filters.categories.length > 0) ||
    (filters.countries && filters.countries.length > 0) ||
    (filters.regions && filters.regions.length > 0) ||
    filters.transboundary !== undefined ||
    filters.danger !== undefined ||
    (filters.yearRange && (filters.yearRange.min || filters.yearRange.max))

  const handleClearFilters = () => {
    onFiltersChange({})
    onSearchChange('')
    setCountrySearch('')
  }

  const handleCategoryToggle = (category: 'Cultural' | 'Natural' | 'Mixed') => {
    const current = filters.categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    onFiltersChange({ ...filters, categories: updated.length > 0 ? updated : undefined })
  }

  const handleCountryToggle = (countryCode: string) => {
    const current = filters.countries || []
    const updated = current.includes(countryCode)
      ? current.filter((c) => c !== countryCode)
      : [...current, countryCode]
    onFiltersChange({ ...filters, countries: updated.length > 0 ? updated : undefined })
  }

  const handleRegionToggle = (region: string) => {
    const current = filters.regions || []
    const updated = current.includes(region)
      ? current.filter((r) => r !== region)
      : [...current, region]
    onFiltersChange({ ...filters, regions: updated.length > 0 ? updated : undefined })
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

  const handleYearChange = (type: 'min' | 'max', value: number) => {
    const current = filters.yearRange || {}
    onFiltersChange({
      ...filters,
      yearRange: {
        ...current,
        [type]: value,
      },
    })
  }

  return (
    <div className="w-full md:w-[400px] h-full bg-white shadow-lg flex flex-col border-r border-gray-200 overflow-hidden">
      {/* Header with Logo & Stats */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-xs text-gray-600 mt-1">{t.subtitle}</p>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-blue-600">{totalCount}</span>
            <span className="text-gray-600 text-xs">{t.sites}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-purple-600">
              {availableCountries.length}
            </span>
            <span className="text-gray-600 text-xs">{t.countries}</span>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.search}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
        <p className="text-xs text-gray-500 mt-2">
          {t.showing} <span className="font-semibold text-blue-600">{results.length}</span> {t.of}{' '}
          {totalCount} {t.sites}
        </p>
      </div>

      {/* Mini Games Section */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">🎮 {t.gamesTitle}</h3>
        <Link
          href={`/${locale}/games/geo-challenge`}
          className="block w-full bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-gray-900 hover:text-white border-2 border-purple-200 hover:border-transparent font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-bold group-hover:text-white transition-colors">
                🌍 {t.geoChallenge}
              </div>
              <div className="text-xs text-gray-600 group-hover:text-purple-100 transition-colors mt-1">
                {t.geoChallengeDesc}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Statistics Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900 text-sm">{t.statistics}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isStatsExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isStatsExpanded && (
          <div className="px-4 pb-4 bg-gray-50 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t.cultural}</span>
              <span className="font-semibold text-purple-600">
                {statistics.byCategory.Cultural}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t.natural}</span>
              <span className="font-semibold text-green-600">{statistics.byCategory.Natural}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t.mixed}</span>
              <span className="font-semibold text-orange-600">{statistics.byCategory.Mixed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t.transboundary}</span>
              <span className="font-semibold text-blue-600">{statistics.transboundary}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t.danger}</span>
              <span className="font-semibold text-red-600">{statistics.danger}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900 text-sm">{t.filters}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isFiltersExpanded && (
          <div className="p-4 space-y-4 bg-gray-50 max-h-96 overflow-y-auto">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">{t.category}</label>
              <div className="space-y-2">
                {(['Cultural', 'Natural', 'Mixed'] as const).map((category) => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category) || false}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">
                      {t[category.toLowerCase() as 'cultural' | 'natural' | 'mixed']}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">{t.region}</label>
              <div className="space-y-2">
                {regionOptions.map((region) => (
                  <label key={region.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.regions?.includes(region.value) || false}
                      onChange={() => handleRegionToggle(region.value)}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">{region.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Country Filter with Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {t.country}
                {filters.countries && filters.countries.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({filters.countries.length} {t.selectedCount})
                  </span>
                )}
              </label>
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder={t.searchCountry}
                className="w-full px-3 py-1.5 mb-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded p-2 bg-white">
                {filteredCountries.slice(0, 30).map((country) => (
                  <label
                    key={country.code}
                    className="flex items-center justify-between cursor-pointer py-1 hover:bg-gray-50 px-1 rounded"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={filters.countries?.includes(country.code) || false}
                        onChange={() => handleCountryToggle(country.code)}
                        className="mr-2 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <span className="text-xs text-gray-700 truncate">{country.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      ({country.count})
                    </span>
                  </label>
                ))}
                {filteredCountries.length > 30 && (
                  <p className="text-xs text-gray-500 italic pt-2 text-center">
                    Showing first 30 of {filteredCountries.length}
                  </p>
                )}
                {filteredCountries.length === 0 && countrySearch && (
                  <p className="text-xs text-gray-500 italic py-2 text-center">
                    No countries found
                  </p>
                )}
              </div>
            </div>

            {/* Year Range Slider */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">{t.yearRange}</label>
              <div className="space-y-2">
                <div>
                  <input
                    type="range"
                    min={statistics.yearRange.min}
                    max={statistics.yearRange.max}
                    value={filters.yearRange?.min || statistics.yearRange.min}
                    onChange={(e) => handleYearChange('min', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Min: {filters.yearRange?.min || statistics.yearRange.min}</span>
                  </div>
                </div>
                <div>
                  <input
                    type="range"
                    min={statistics.yearRange.min}
                    max={statistics.yearRange.max}
                    value={filters.yearRange?.max || statistics.yearRange.max}
                    onChange={(e) => handleYearChange('max', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Max: {filters.yearRange?.max || statistics.yearRange.max}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">{t.status}</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.transboundary === true}
                    onChange={() => handleStatusToggle('transboundary')}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">{t.transboundary}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.danger === true}
                    onChange={() => handleStatusToggle('danger')}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">{t.danger}</span>
                </label>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
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
            <p className="text-base font-medium">{t.noResults}</p>
            <p className="text-xs mt-2">{t.tryDifferent}</p>
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
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <h3 className="font-semibold text-xs text-gray-900 line-clamp-2">
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
