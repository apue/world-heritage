/**
 * Utility functions for geo-challenge game
 */

import { HeritageSite } from '@/lib/data/types'
import { GameConfig } from './types'

/**
 * Default game configuration
 */
export const DEFAULT_CONFIG: GameConfig = {
  totalRounds: 10,
  maxScorePerRound: 1000,
  perfectGuessThreshold: 10, // Within 10km = perfect
  goodGuessThreshold: 50, // Within 50km = good
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 *
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Calculate score based on distance
 * Perfect guess (< 10km): 1000 points
 * Linear decay to 0 at 1000km+
 */
export function calculateScore(distance: number, config: GameConfig = DEFAULT_CONFIG): number {
  const { maxScorePerRound } = config

  if (distance < 0) return 0

  // Perfect guess
  if (distance <= config.perfectGuessThreshold) {
    return maxScorePerRound
  }

  // Linear decay: score = max * (1 - distance/1000)
  // At 1000km or more, score = 0
  const maxDistance = 1000
  const score = maxScorePerRound * Math.max(0, 1 - distance / maxDistance)

  return Math.round(score)
}

/**
 * Select random sites for the game
 * Ensures geographic diversity by selecting from different regions
 */
export function selectRandomSites(allSites: HeritageSite[], count: number): HeritageSite[] {
  // Group sites by region
  const sitesByRegion: Record<string, HeritageSite[]> = {}

  allSites.forEach((site) => {
    if (!sitesByRegion[site.region]) {
      sitesByRegion[site.region] = []
    }
    sitesByRegion[site.region].push(site)
  })

  const regions = Object.keys(sitesByRegion)
  const selected: HeritageSite[] = []

  // Try to pick sites from different regions for diversity
  let regionIndex = 0

  while (selected.length < count && selected.length < allSites.length) {
    const region = regions[regionIndex % regions.length]
    const sitesInRegion = sitesByRegion[region]

    if (sitesInRegion && sitesInRegion.length > 0) {
      // Pick random site from this region
      const randomIndex = Math.floor(Math.random() * sitesInRegion.length)
      const site = sitesInRegion[randomIndex]

      // Remove from pool to avoid duplicates
      sitesInRegion.splice(randomIndex, 1)

      selected.push(site)
    }

    regionIndex++

    // Safety check: if we've cycled through all regions and still need more,
    // start picking randomly from all remaining sites
    if (regionIndex >= regions.length * 3 && selected.length < count) {
      const remaining = Object.values(sitesByRegion).flat()
      if (remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length)
        selected.push(remaining[randomIndex])
      }
    }
  }

  return selected
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`
  }
  return `${Math.round(km)} km`
}

/**
 * Get feedback message based on distance
 */
export function getDistanceFeedback(distance: number, locale: 'en' | 'zh'): string {
  const messages = {
    en: {
      perfect: 'Perfect! 🎯',
      excellent: 'Excellent! 🌟',
      good: 'Good guess! 👍',
      ok: 'Not bad! 👌',
      far: 'Quite far! 🤔',
      veryFar: 'Very far! 😅',
    },
    zh: {
      perfect: '完美！🎯',
      excellent: '太棒了！🌟',
      good: '不错！👍',
      ok: '还可以！👌',
      far: '有点远！🤔',
      veryFar: '太远了！😅',
    },
  }

  const msg = messages[locale]

  if (distance <= 10) return msg.perfect
  if (distance <= 50) return msg.excellent
  if (distance <= 200) return msg.good
  if (distance <= 500) return msg.ok
  if (distance <= 1000) return msg.far
  return msg.veryFar
}

/**
 * Calculate final statistics
 */
export function calculateStats(distances: number[], scores: number[]) {
  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  const averageDistance =
    distances.length > 0 ? distances.reduce((sum, d) => sum + d, 0) / distances.length : 0

  const perfectGuesses = distances.filter((d) => d <= DEFAULT_CONFIG.perfectGuessThreshold).length
  const goodGuesses = distances.filter((d) => d <= DEFAULT_CONFIG.goodGuessThreshold).length

  return {
    totalScore,
    averageDistance: Math.round(averageDistance * 10) / 10,
    perfectGuesses,
    goodGuesses,
  }
}
