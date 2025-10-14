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
  componentId: string
  parentId: string
  name: Record<Locale, string>
  latitude: number
  longitude: number
  description?: Record<Locale, string>
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
