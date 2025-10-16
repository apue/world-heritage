/**
 * Data types for World Heritage Sites
 */

import { Locale } from '@/lib/i18n/config'

/**
 * Translation data for a specific language
 */
export interface SiteTranslation {
  name: string
  description: string
  states: string
  location: string
  justification: string
}

/**
 * Component site (sub-site) information
 * For serial/transboundary properties with multiple component parts
 */
export interface ComponentSite {
  componentId: string // Wikidata QID (e.g., "Q29583927")
  wikidataUri: string // Full Wikidata URI
  parentId: string // UNESCO whs_id

  // Geographic information (required)
  latitude: number
  longitude: number
  country?: string // ISO country code (optional)

  // Multi-language names
  name: Record<Locale, string>
  description?: Record<Locale, string>

  // Metadata (optional, from WDPA)
  area?: number
  designation?: string
}

/**
 * Main heritage site data structure
 */
export interface HeritageSite {
  id: string
  idNumber: string
  uniqueNumber: string

  // Geographic data
  latitude: number
  longitude: number
  region: string
  isoCodes: string[]

  // Classification
  category: 'Cultural' | 'Natural' | 'Mixed'
  criteriaText: string

  // Dates and status
  dateInscribed: number
  secondaryDates: string
  danger: boolean
  dangerPeriod: string

  // Metadata
  transboundary: boolean
  extension: number
  revision: number

  // URLs
  httpUrl: string
  imageUrl: string

  // Multi-language content
  translations: Record<Locale, SiteTranslation>

  // Component sites (optional, for future expansion)
  hasComponents?: boolean
  componentCount?: number
  components?: ComponentSite[]
}

/**
 * Filter options for searching and filtering sites
 */
export interface SiteFilters {
  // Country filter (multi-select, ISO codes)
  countries?: string[]

  // Region filter (multi-select)
  regions?: string[]

  // Category filter (multi-select)
  categories?: Array<'Cultural' | 'Natural' | 'Mixed'>

  // Inscription year range
  yearRange?: {
    min?: number
    max?: number
  }

  // Status filters
  transboundary?: boolean
  danger?: boolean

  // Future user-related filters
  visited?: boolean
  wishlist?: boolean
}

/**
 * Search and filter result
 */
export interface SearchResult {
  sites: HeritageSite[]
  total: number
  filtered: number
}

/**
 * User site status (visited, wishlist, bookmark)
 */
export interface UserSiteStatus {
  visited: boolean
  visitProgress?: PropertyVisitProgress // For sites with components
  wishlist: boolean
  bookmark: boolean
}

/**
 * User visit detail
 */
export interface UserVisitDetail {
  id: string
  userId: string
  siteId: string
  visitDate: string // ISO date string
  notes?: string
  rating?: number // 1-5 stars
  photos?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * User wishlist item detail
 */
export interface UserWishlistDetail {
  id: string
  userId: string
  siteId: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
  plannedDate?: string
  createdAt: string
  updatedAt: string
}

/**
 * User bookmark detail
 */
export interface UserBookmarkDetail {
  id: string
  userId: string
  siteId: string
  notes?: string
  tags?: string[]
  createdAt: string
}

/**
 * User statistics
 */
export interface UserStats {
  visited: number
  wishlist: number
  bookmark: number
}

/**
 * User component visit record
 * Stores visits at component level for serial properties
 */
export interface UserComponentVisit {
  id: string
  userId: string
  componentId: string // Wikidata QID
  siteId: string // UNESCO whs_id (redundant for query optimization)
  visitDate: string // ISO date string
  notes?: string
  photos?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Property visit progress
 * Aggregated from component-level visits
 */
export interface PropertyVisitProgress {
  siteId: string
  totalComponents: number
  visitedComponents: number
  progress: number // 0-1 (e.g., 0.33 for 1/3)
  isVisited: boolean // true if any component visited (fixed "Any" logic)
  visitedComponentIds: string[]
}
