'use client'

/**
 * Explore page - Interactive map view with search and filters
 * Google Maps-style layout with sidebar and full-screen map
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
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  ),
})

export default function ExplorePage() {
  const params = useParams()
  const locale = params.locale as Locale

  // Data state
  const [allSites, setAllSites] = useState<HeritageSite[]>([])
  const [filteredSites, setFilteredSites] = useState<HeritageSite[]>([])
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SiteFilters>({})

  // Get available countries
  const availableCountries = useMemo(() => getAllCountries(), [])

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <ExploreSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        results={filteredSites}
        totalCount={allSites.length}
        onSiteSelect={setSelectedSite}
        selectedSite={selectedSite}
        availableCountries={availableCountries}
        locale={locale}
      />

      {/* Map Area */}
      <div className="flex-1 relative">
        <HeritageMap
          sites={filteredSites}
          selectedSite={selectedSite}
          onMarkerClick={setSelectedSite}
        />
      </div>
    </div>
  )
}
