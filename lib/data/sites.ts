/**
 * Data access layer for World Heritage Sites
 * Provides functions to load, search, and filter site data
 */

import { Locale } from '@/lib/i18n/config'
import { HeritageSite, SiteFilters, SearchResult } from './types'
import sitesData from '@/public/sites.json'

// Cast imported JSON data to proper type
const sites = sitesData as HeritageSite[]

/**
 * Get all heritage sites
 */
export function getAllSites(): HeritageSite[] {
  return sites
}

/**
 * Get a single site by ID
 */
export function getSiteById(id: string): HeritageSite | undefined {
  return sites.find((site) => site.id === id || site.idNumber === id)
}

/**
 * Get sites by IDs
 */
export function getSitesByIds(ids: string[]): HeritageSite[] {
  return sites.filter((site) => ids.includes(site.id) || ids.includes(site.idNumber))
}

/**
 * Search sites by query string (supports multi-language)
 * Searches in name, states, location, and description
 */
export function searchSites(query: string, locale: Locale): HeritageSite[] {
  if (!query || query.trim() === '') {
    return sites
  }

  const normalizedQuery = query.toLowerCase().trim()

  return sites.filter((site) => {
    const translation = site.translations[locale]

    if (!translation) return false

    // Build searchable text from multiple fields
    const searchableText = [
      translation.name,
      translation.states,
      translation.location,
      translation.description,
    ]
      .join(' ')
      .toLowerCase()

    // Support multiple keywords (AND logic)
    const keywords = normalizedQuery.split(/\s+/)
    return keywords.every((keyword) => searchableText.includes(keyword))
  })
}

/**
 * Filter sites based on provided filters
 */
export function filterSites(sites: HeritageSite[], filters: SiteFilters): HeritageSite[] {
  return sites.filter((site) => {
    // Country filter
    if (filters.countries && filters.countries.length > 0) {
      const hasMatchingCountry = site.isoCodes.some((code) =>
        filters.countries!.includes(code.toLowerCase())
      )
      if (!hasMatchingCountry) return false
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(site.category)) return false
    }

    // Year range filter
    if (filters.yearRange) {
      if (filters.yearRange.min && site.dateInscribed < filters.yearRange.min) {
        return false
      }
      if (filters.yearRange.max && site.dateInscribed > filters.yearRange.max) {
        return false
      }
    }

    // Transboundary filter
    if (filters.transboundary !== undefined) {
      if (site.transboundary !== filters.transboundary) return false
    }

    // Danger filter
    if (filters.danger !== undefined) {
      if (site.danger !== filters.danger) return false
    }

    return true
  })
}

/**
 * Combined search and filter function
 * First filters, then searches
 */
export function searchAndFilter(query: string, filters: SiteFilters, locale: Locale): SearchResult {
  let results = sites

  // Apply filters first
  results = filterSites(results, filters)

  // Then apply search
  if (query && query.trim()) {
    results = searchSites(query, locale).filter((site) => results.includes(site))
  }

  return {
    sites: results,
    total: sites.length,
    filtered: results.length,
  }
}

/**
 * Get unique list of countries from all sites
 */
export function getAllCountries(): Array<{ code: string; count: number }> {
  const countryMap = new Map<string, number>()

  sites.forEach((site) => {
    site.isoCodes.forEach((code) => {
      const lowerCode = code.toLowerCase()
      countryMap.set(lowerCode, (countryMap.get(lowerCode) || 0) + 1)
    })
  })

  return Array.from(countryMap.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get site statistics
 */
export function getSiteStatistics() {
  const stats = {
    total: sites.length,
    byCategory: {
      Cultural: sites.filter((s) => s.category === 'Cultural').length,
      Natural: sites.filter((s) => s.category === 'Natural').length,
      Mixed: sites.filter((s) => s.category === 'Mixed').length,
    },
    transboundary: sites.filter((s) => s.transboundary).length,
    danger: sites.filter((s) => s.danger).length,
    yearRange: {
      min: Math.min(...sites.map((s) => s.dateInscribed)),
      max: Math.max(...sites.map((s) => s.dateInscribed)),
    },
  }

  return stats
}

/**
 * Get related sites (same category, same region, or nearby)
 * Simple implementation for now
 */
export function getRelatedSites(siteId: string, limit: number = 6): HeritageSite[] {
  const site = getSiteById(siteId)
  if (!site) return []

  // Find sites in same category and region
  const related = sites
    .filter((s) => s.id !== siteId)
    .filter((s) => s.category === site.category || s.region === site.region)
    .slice(0, limit)

  return related
}
