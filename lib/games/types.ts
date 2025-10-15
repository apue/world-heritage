/**
 * Game-related types and interfaces
 */

import { HeritageSite } from '@/lib/data/types'

/**
 * Game status
 */
export type GameStatus = 'idle' | 'playing' | 'finished'

/**
 * A single round in the geo-challenge game
 */
export interface GeoRound {
  roundNumber: number
  site: HeritageSite
  userGuess: { lat: number; lng: number } | null
  distance: number | null // Distance in kilometers
  score: number | null // Score for this round (0-1000)
  answered: boolean
}

/**
 * Complete game state for geo-challenge
 */
export interface GeoGameState {
  status: GameStatus
  currentRound: number
  totalRounds: number
  rounds: GeoRound[]
  totalScore: number
}

/**
 * Final game results
 */
export interface GeoGameResults {
  totalScore: number
  maxScore: number
  averageDistance: number
  perfectGuesses: number // Guesses within 10km
  goodGuesses: number // Guesses within 50km
  rounds: GeoRound[]
}

/**
 * Difficulty level (for future expansion)
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

/**
 * Game configuration
 */
export interface GameConfig {
  totalRounds: number
  maxScorePerRound: number
  perfectGuessThreshold: number // km
  goodGuessThreshold: number // km
}

/**
 * Temperature hint for Hot & Cold game
 */
export type TemperatureHint = 'correct' | 'hot' | 'warm' | 'cool' | 'cold'

/**
 * A single guess attempt in Hot & Cold game
 */
export interface HotColdGuess {
  lat: number
  lng: number
  distance: number
  hint: TemperatureHint
  attemptNumber: number
}

/**
 * A single round in the Hot & Cold game
 */
export interface HotColdRound {
  roundNumber: number
  site: HeritageSite
  guesses: HotColdGuess[]
  maxAttempts: number
  solved: boolean
  score: number | null // Score for this round based on attempts used
}

/**
 * Complete game state for Hot & Cold game
 */
export interface HotColdGameState {
  status: GameStatus
  currentRound: number
  totalRounds: number
  rounds: HotColdRound[]
  totalScore: number
}
