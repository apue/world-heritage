'use client'

/**
 * Home page - The central hub for World Heritage exploration
 * Features: Interactive map, search, filters, and site browsing
 * Previously: /explore page
 */

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { getAllSites, searchAndFilter, getAllCountries, getSiteStatistics } from '@/lib/data/sites'
import { HeritageSite, SiteFilters } from '@/lib/data/types'
import { Locale } from '@/lib/i18n/config'
import ExploreSidebar from '@/components/explore/ExploreSidebar'

// Dynamic import to avoid SSR issues with Leaflet
const HeritageMap = dynamic(() => import('@/components/map/HeritageMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const params = useParams()
  const locale = params.locale as Locale

  // Data state
  const [allSites, setAllSites] = useState<HeritageSite[]>([])
  const [filteredSites, setFilteredSites] = useState<HeritageSite[]>([])
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SiteFilters>({})

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Get available countries and statistics
  const availableCountries = useMemo(() => getAllCountries(), [])
  const statistics = useMemo(() => getSiteStatistics(), [])

  // Load all sites on mount
  useEffect(() => {
    const sites = getAllSites()
    setAllSites(sites)
    setFilteredSites(sites)
  }, [])

  // Apply search and filters when they change
  useEffect(() => {
    const result = searchAndFilter(searchQuery, filters, locale)
    setFilteredSites(result.sites)
  }, [searchQuery, filters, locale])

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar - Mobile: Overlay, Desktop: Always visible */}
      <div
        className={`
          fixed md:relative inset-0 md:inset-auto
          z-40 md:z-auto
          transform md:transform-none transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="md:hidden absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar content */}
        <div className="relative h-full">
          <ExploreSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            results={filteredSites}
            totalCount={allSites.length}
            onSiteSelect={(site) => {
              setSelectedSite(site)
              setIsSidebarOpen(false) // Close sidebar on mobile when selecting a site
            }}
            selectedSite={selectedSite}
            availableCountries={availableCountries}
            statistics={statistics}
            locale={locale}
          />
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <HeritageMap
          sites={filteredSites}
          locale={locale}
          selectedSite={selectedSite}
          onMarkerClick={setSelectedSite}
        />
      </div>
    </div>
  )
}
