/**
 * Utility functions for Hot & Cold challenge game
 */

import { TemperatureHint } from './types'

/**
 * Hot & Cold game configuration
 */
export const HOTCOLD_CONFIG = {
  totalRounds: 10,
  maxAttempts: 5,
  correctThreshold: 50, // < 50km = correct
  hotThreshold: 100, // < 100km = hot
  warmThreshold: 500, // < 500km = warm
  coolThreshold: 1000, // < 1000km = cool
  // > 1000km = cold
}

/**
 * Scoring system based on number of attempts used
 */
export const ATTEMPT_SCORES = {
  1: 1000,
  2: 750,
  3: 500,
  4: 250,
  5: 100,
}

/**
 * Get temperature hint based on distance
 */
export function getTemperatureHint(distance: number): TemperatureHint {
  if (distance < HOTCOLD_CONFIG.correctThreshold) return 'correct'
  if (distance < HOTCOLD_CONFIG.hotThreshold) return 'hot'
  if (distance < HOTCOLD_CONFIG.warmThreshold) return 'warm'
  if (distance < HOTCOLD_CONFIG.coolThreshold) return 'cool'
  return 'cold'
}

/**
 * Get display text for temperature hint
 */
export function getTemperatureText(hint: TemperatureHint, locale: 'en' | 'zh'): string {
  const messages = {
    en: {
      correct: 'Correct! 🎯',
      hot: 'Hot! 🔥',
      warm: 'Warm 🌡️',
      cool: 'Cool ❄️',
      cold: 'Cold 🧊',
    },
    zh: {
      correct: '正确！🎯',
      hot: '很接近！🔥',
      warm: '有点接近 🌡️',
      cool: '有点远 ❄️',
      cold: '太远了 🧊',
    },
  }

  return messages[locale][hint]
}

/**
 * Get emoji for temperature hint
 */
export function getTemperatureEmoji(hint: TemperatureHint): string {
  const emojis = {
    correct: '🎯',
    hot: '🔥',
    warm: '🌡️',
    cool: '❄️',
    cold: '🧊',
  }
  return emojis[hint]
}

/**
 * Calculate score based on number of attempts used
 */
export function calculateHotColdScore(attemptNumber: number): number {
  return ATTEMPT_SCORES[attemptNumber as keyof typeof ATTEMPT_SCORES] || 0
}

/**
 * Get hint description (distance range explanation)
 */
export function getHintDescription(hint: TemperatureHint, locale: 'en' | 'zh'): string {
  const descriptions = {
    en: {
      correct: 'Within 50 km - You found it!',
      hot: 'Within 100 km - Very close!',
      warm: 'Within 500 km - Getting closer',
      cool: 'Within 1000 km - Still far',
      cold: 'Over 1000 km - Very far',
    },
    zh: {
      correct: '在 50 公里内 - 找到了！',
      hot: '在 100 公里内 - 非常接近！',
      warm: '在 500 公里内 - 越来越近',
      cool: '在 1000 公里内 - 还是有点远',
      cold: '超过 1000 公里 - 非常远',
    },
  }

  return descriptions[locale][hint]
}

/**
 * Calculate final statistics for Hot & Cold game
 */
export function calculateHotColdStats(
  rounds: {
    solved: boolean
    score: number | null
    guesses: { attemptNumber: number }[]
  }[]
) {
  const totalScore = rounds.reduce((sum, round) => sum + (round.score || 0), 0)
  const solvedRounds = rounds.filter((r) => r.solved).length
  const totalAttempts = rounds.reduce((sum, round) => sum + round.guesses.length, 0)
  const averageAttempts =
    solvedRounds > 0
      ? rounds.filter((r) => r.solved).reduce((sum, round) => sum + round.guesses.length, 0) /
        solvedRounds
      : 0

  const firstAttemptSolves = rounds.filter((r) => r.solved && r.guesses.length === 1).length

  return {
    totalScore,
    solvedRounds,
    totalRounds: rounds.length,
    totalAttempts,
    averageAttempts: Math.round(averageAttempts * 10) / 10,
    firstAttemptSolves,
    successRate: Math.round((solvedRounds / rounds.length) * 100),
  }
}
