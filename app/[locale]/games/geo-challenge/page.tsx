'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getAllSites } from '@/lib/data/sites'
import {
  selectRandomSites,
  calculateDistance,
  calculateScore,
  formatDistance,
  getDistanceFeedback,
  calculateStats,
  DEFAULT_CONFIG,
} from '@/lib/games/geo-utils'
import { GeoGameState, GeoRound } from '@/lib/games/types'
import type { Locale } from '@/lib/i18n/config'

// Dynamically import map component to avoid SSR issues
const GeoGameMap = dynamic(() => import('@/components/games/GeoGameMap'), { ssr: false })

export default function GeoChallengeGame() {
  const params = useParams()
  const locale = params?.locale as Locale

  const [gameState, setGameState] = useState<GeoGameState>({
    status: 'idle',
    currentRound: 0,
    totalRounds: DEFAULT_CONFIG.totalRounds,
    rounds: [],
    totalScore: 0,
  })

  const [showFeedback, setShowFeedback] = useState(false)
  const MAP_LAYER = { base: 200, overlay: 1200 } as const

  // Initialize game
  const startGame = () => {
    const allSites = getAllSites()
    const selectedSites = selectRandomSites(allSites, DEFAULT_CONFIG.totalRounds)

    const rounds: GeoRound[] = selectedSites.map((site, index) => ({
      roundNumber: index + 1,
      site,
      userGuess: null,
      distance: null,
      score: null,
      answered: false,
    }))

    setGameState({
      status: 'playing',
      currentRound: 0,
      totalRounds: DEFAULT_CONFIG.totalRounds,
      rounds,
      totalScore: 0,
    })
    setShowFeedback(false)
  }

  // Handle user guess
  const handleGuess = (lat: number, lng: number) => {
    if (gameState.status !== 'playing' || showFeedback) return

    const currentRound = gameState.rounds[gameState.currentRound]
    const site = currentRound.site

    // Calculate distance and score
    const distance = calculateDistance(lat, lng, site.latitude, site.longitude)
    const score = calculateScore(distance)

    // Update round
    const updatedRounds = [...gameState.rounds]
    updatedRounds[gameState.currentRound] = {
      ...currentRound,
      userGuess: { lat, lng },
      distance,
      score,
      answered: true,
    }

    setGameState({
      ...gameState,
      rounds: updatedRounds,
      totalScore: gameState.totalScore + score,
    })

    setShowFeedback(true)
  }

  // Move to next round
  const nextRound = () => {
    const nextRoundIndex = gameState.currentRound + 1

    if (nextRoundIndex >= gameState.totalRounds) {
      // Game finished
      setGameState({
        ...gameState,
        status: 'finished',
      })
    } else {
      // Next round
      setGameState({
        ...gameState,
        currentRound: nextRoundIndex,
      })
      setShowFeedback(false)
    }
  }

  const currentRound = gameState.rounds[gameState.currentRound]
  const isPlaying = gameState.status === 'playing'
  const isFinished = gameState.status === 'finished'

  // Calculate final stats
  const stats = isFinished
    ? calculateStats(
        gameState.rounds.map((r) => r.distance!),
        gameState.rounds.map((r) => r.score!)
      )
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Idle State - Welcome Screen */}
      {gameState.status === 'idle' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
              {locale === 'zh' ? '🌍 地理定位挑战' : '🌍 Geo-Location Challenge'}
            </h1>

            <div className="prose prose-lg max-w-none mb-8">
              {locale === 'zh' ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">游戏规则</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>我们会展示 10 个世界遗产地点</li>
                    <li>你需要在地图上标记它们的位置</li>
                    <li>距离越近，分数越高（满分 1000 分）</li>
                    <li>10 公里内算完美猜测 🎯</li>
                    <li>挑战你的地理知识吧！</li>
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Play</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>We&apos;ll show you 10 World Heritage Sites</li>
                    <li>Click on the map to guess their location</li>
                    <li>The closer you are, the higher your score (max 1000 points)</li>
                    <li>Within 10km = perfect guess 🎯</li>
                    <li>Test your geography knowledge!</li>
                  </ul>
                </>
              )}
            </div>

            <button
              onClick={startGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-4 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              {locale === 'zh' ? '开始游戏' : 'Start Game'}
            </button>

            <Link
              href={`/${locale}`}
              className="block text-center mt-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {locale === 'zh' ? '← 返回首页' : '← Back to Home'}
            </Link>
          </div>
        </div>
      )}

      {/* Playing State - Game Map */}
      {isPlaying && currentRound && (
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {locale === 'zh' ? '地理挑战' : 'Geo Challenge'}
                </h2>
                <div className="text-sm md:text-base text-gray-600">
                  {locale === 'zh' ? '第' : 'Round'} {gameState.currentRound + 1} /{' '}
                  {gameState.totalRounds}
                </div>
              </div>

              <div className="text-lg md:text-xl font-bold text-blue-600">
                {gameState.totalScore} {locale === 'zh' ? '分' : 'pts'}
              </div>
            </div>
          </div>

          {/* Site Info Panel */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-6 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Site Image */}
                {currentRound.site.imageUrl && (
                  <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden shadow-lg relative">
                    <Image
                      src={currentRound.site.imageUrl}
                      alt={currentRound.site.translations[locale].name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  </div>
                )}

                {/* Site Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {currentRound.site.translations[locale].name}
                  </h3>
                  {!showFeedback && (
                    <p className="text-blue-100 text-sm md:text-base">
                      {locale === 'zh'
                        ? '👆 点击地图标记这个遗产地的位置'
                        : '👆 Click on the map to mark the location of this site'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <div className="h-full relative" style={{ zIndex: MAP_LAYER.base }}>
              <GeoGameMap
                currentRound={currentRound}
                onGuess={handleGuess}
                showAnswer={showFeedback}
                locale={locale}
              />
            </div>

            {/* Feedback Panel */}
            {showFeedback && currentRound.answered && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl"
                style={{ zIndex: MAP_LAYER.overlay }}
              >
                <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <div className="text-3xl md:text-4xl font-bold mb-2">
                        {getDistanceFeedback(currentRound.distance!, locale)}
                      </div>
                      <div className="text-xl md:text-2xl text-gray-600 mb-1">
                        {locale === 'zh' ? '距离：' : 'Distance: '}
                        <span className="font-bold text-gray-900">
                          {formatDistance(currentRound.distance!)}
                        </span>
                      </div>
                      <div className="text-lg md:text-xl text-blue-600">
                        {locale === 'zh' ? '得分：' : 'Score: '}
                        <span className="font-bold">
                          +{currentRound.score} {locale === 'zh' ? '分' : 'pts'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={nextRound}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                    >
                      {gameState.currentRound + 1 >= gameState.totalRounds
                        ? locale === 'zh'
                          ? '查看结果'
                          : 'See Results'
                        : locale === 'zh'
                          ? '下一题'
                          : 'Next Round'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finished State - Results */}
      {isFinished && stats && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
              {locale === 'zh' ? '🎉 游戏结束！' : '🎉 Game Over!'}
            </h1>
            <p className="text-center text-gray-600 text-lg mb-8">
              {locale === 'zh' ? '你的最终成绩' : 'Your Final Score'}
            </p>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8 text-center">
              <div className="text-6xl md:text-7xl font-bold mb-2">{stats.totalScore}</div>
              <div className="text-2xl opacity-90">
                / {DEFAULT_CONFIG.totalRounds * DEFAULT_CONFIG.maxScorePerRound}{' '}
                {locale === 'zh' ? '分' : 'points'}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatDistance(stats.averageDistance)}
                </div>
                <div className="text-gray-600">
                  {locale === 'zh' ? '平均距离' : 'Average Distance'}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.perfectGuesses}</div>
                <div className="text-gray-600">
                  {locale === 'zh' ? '完美猜测' : 'Perfect Guesses'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ({locale === 'zh' ? '< 10 公里' : '< 10 km'})
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.goodGuesses}</div>
                <div className="text-gray-600">
                  {locale === 'zh' ? '不错的猜测' : 'Good Guesses'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ({locale === 'zh' ? '< 50 公里' : '< 50 km'})
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                {locale === 'zh' ? '再玩一次' : 'Play Again'}
              </button>
              <Link
                href={`/${locale}`}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 text-lg font-semibold py-4 px-8 rounded-xl transition-colors text-center"
              >
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
