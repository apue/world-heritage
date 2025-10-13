/**
 * Core types for World Heritage application
 */

export interface HeritageSite {
  id: string
  idNumber: string
  site: string
  category: 'Cultural' | 'Natural' | 'Mixed'
  states: string
  isoCodes: string[]
  region: string
  latitude: number
  longitude: number
  dateInscribed: number
  criteriaText: string
  imageUrl: string
  httpUrl: string
  shortDescription: string
  danger: string
  transboundary: boolean
  uniqueNumber: string
  location?: string
  justification?: string
  extension?: number
  revision?: number
  secondaryDates?: string
}

export interface GameResult {
  score: number
  totalQuestions: number
  answers: GameAnswer[]
  timestamp: number
}

export interface GameAnswer {
  questionId: string
  userAnswer: any
  correctAnswer: any
  isCorrect: boolean
  points: number
}
