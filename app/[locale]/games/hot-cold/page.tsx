'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getAllSites } from '@/lib/data/sites'
import { selectRandomSites, calculateDistance, formatDistance } from '@/lib/games/geo-utils'
import {
  HOTCOLD_CONFIG,
  getTemperatureHint,
  getTemperatureText,
  calculateHotColdScore,
  getHintDescription,
  calculateHotColdStats,
  ATTEMPT_SCORES,
} from '@/lib/games/hotcold-utils'
import { HotColdGameState, HotColdRound, HotColdGuess } from '@/lib/games/types'
import type { Locale } from '@/lib/i18n/config'

// Dynamically import map component to avoid SSR issues
const HotColdGameMap = dynamic(() => import('@/components/games/HotColdGameMap'), { ssr: false })

export default function HotColdGame() {
  const params = useParams()
  const locale = params?.locale as Locale

  const [gameState, setGameState] = useState<HotColdGameState>({
    status: 'idle',
    currentRound: 0,
    totalRounds: HOTCOLD_CONFIG.totalRounds,
    rounds: [],
    totalScore: 0,
  })

  const [currentGuess, setCurrentGuess] = useState<HotColdGuess | null>(null)
  const MAP_LAYER = { base: 200, overlay: 1200 } as const

  // Initialize game
  const startGame = () => {
    const allSites = getAllSites()
    const selectedSites = selectRandomSites(allSites, HOTCOLD_CONFIG.totalRounds)

    const rounds: HotColdRound[] = selectedSites.map((site, index) => ({
      roundNumber: index + 1,
      site,
      guesses: [],
      maxAttempts: HOTCOLD_CONFIG.maxAttempts,
      solved: false,
      score: null,
    }))

    setGameState({
      status: 'playing',
      currentRound: 0,
      totalRounds: HOTCOLD_CONFIG.totalRounds,
      rounds,
      totalScore: 0,
    })
    setCurrentGuess(null)
  }

  // Handle user guess
  const handleGuess = (lat: number, lng: number) => {
    if (gameState.status !== 'playing') return

    const currentRound = gameState.rounds[gameState.currentRound]
    if (currentRound.solved || currentRound.guesses.length >= HOTCOLD_CONFIG.maxAttempts) return

    const site = currentRound.site

    // Calculate distance and hint
    const distance = calculateDistance(lat, lng, site.latitude, site.longitude)
    const hint = getTemperatureHint(distance)
    const attemptNumber = currentRound.guesses.length + 1

    const newGuess: HotColdGuess = {
      lat,
      lng,
      distance,
      hint,
      attemptNumber,
    }

    // Update guesses
    const updatedGuesses = [...currentRound.guesses, newGuess]
    const solved = hint === 'correct'
    const score = solved ? calculateHotColdScore(attemptNumber) : null
    const isLastAttempt = attemptNumber >= HOTCOLD_CONFIG.maxAttempts

    // Update round
    const updatedRounds = [...gameState.rounds]
    updatedRounds[gameState.currentRound] = {
      ...currentRound,
      guesses: updatedGuesses,
      solved,
      score: solved ? score : isLastAttempt ? 0 : null,
    }

    setGameState({
      ...gameState,
      rounds: updatedRounds,
      totalScore: solved ? gameState.totalScore + score! : gameState.totalScore,
    })

    setCurrentGuess(newGuess)
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
      setCurrentGuess(null)
    }
  }

  const currentRound = gameState.rounds[gameState.currentRound]
  const isPlaying = gameState.status === 'playing'
  const isFinished = gameState.status === 'finished'

  // Check if round is over (solved or max attempts reached)
  const isRoundOver =
    currentRound &&
    (currentRound.solved || currentRound.guesses.length >= HOTCOLD_CONFIG.maxAttempts)

  // Calculate final stats
  const stats = isFinished ? calculateHotColdStats(gameState.rounds) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Idle State - Welcome Screen */}
      {gameState.status === 'idle' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
              {locale === 'zh' ? '🔥 冷热挑战' : '🔥 Hot & Cold Challenge'}
            </h1>

            <div className="prose prose-lg max-w-none mb-8">
              {locale === 'zh' ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">游戏规则</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>我们会展示 10 个世界遗产地点</li>
                    <li>每个地点最多可以猜 5 次</li>
                    <li>在地图上点击你认为的位置</li>
                    <li>根据距离获得温度提示：</li>
                  </ul>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 my-4">
                    <ul className="space-y-1 text-sm">
                      <li>
                        🎯 <strong>正确</strong> - 在 50 公里内
                      </li>
                      <li>
                        🔥 <strong>很接近</strong> - 在 100 公里内
                      </li>
                      <li>
                        🌡️ <strong>有点接近</strong> - 在 500 公里内
                      </li>
                      <li>
                        ❄️ <strong>有点远</strong> - 在 1000 公里内
                      </li>
                      <li>
                        🧊 <strong>太远了</strong> - 超过 1000 公里
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-600 mt-4">
                    <strong>计分规则：</strong>猜对的次数越少，分数越高！第 1 次猜对得 1000 分，第 5
                    次猜对得 100 分。
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Play</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>We&apos;ll show you 10 World Heritage Sites</li>
                    <li>You have up to 5 attempts to find each site</li>
                    <li>Click on the map where you think it is</li>
                    <li>Get temperature hints based on distance:</li>
                  </ul>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 my-4">
                    <ul className="space-y-1 text-sm">
                      <li>
                        🎯 <strong>Correct</strong> - Within 50 km
                      </li>
                      <li>
                        🔥 <strong>Hot</strong> - Within 100 km
                      </li>
                      <li>
                        🌡️ <strong>Warm</strong> - Within 500 km
                      </li>
                      <li>
                        ❄️ <strong>Cool</strong> - Within 1000 km
                      </li>
                      <li>
                        🧊 <strong>Cold</strong> - Over 1000 km
                      </li>
                    </ul>
                  </div>
                  <p className="text-gray-600 mt-4">
                    <strong>Scoring:</strong> Fewer attempts = higher score! 1st attempt: 1000 pts,
                    5th attempt: 100 pts.
                  </p>
                </>
              )}
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
                  {locale === 'zh' ? '冷热挑战' : 'Hot & Cold'}
                </h2>
                <div className="text-sm md:text-base text-gray-600">
                  {locale === 'zh' ? '第' : 'Round'} {gameState.currentRound + 1} /{' '}
                  {gameState.totalRounds}
                </div>
              </div>

              <div className="text-lg md:text-xl font-bold text-orange-600">
                {gameState.totalScore} {locale === 'zh' ? '分' : 'pts'}
              </div>
            </div>
          </div>

          {/* Site Info Panel */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-6 md:px-6">
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
                  {!isRoundOver && (
                    <div className="space-y-2">
                      <p className="text-orange-100 text-sm md:text-base">
                        {locale === 'zh'
                          ? '👆 点击地图找到这个遗产地的位置'
                          : '👆 Click on the map to find this site'}
                      </p>
                      <p className="text-white text-base md:text-lg font-semibold">
                        {locale === 'zh' ? '剩余次数：' : 'Attempts left: '}
                        {HOTCOLD_CONFIG.maxAttempts - currentRound.guesses.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <div className="h-full relative" style={{ zIndex: MAP_LAYER.base }}>
              <HotColdGameMap
                currentRound={currentRound}
                onGuess={handleGuess}
                showAnswer={isRoundOver}
                locale={locale}
              />
            </div>

            {/* Guess Feedback Panel (after each guess) */}
            {currentGuess && !isRoundOver && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl"
                style={{ zIndex: MAP_LAYER.overlay }}
              >
                <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-3">
                      {getTemperatureText(currentGuess.hint, locale)}
                    </div>
                    <div className="text-lg md:text-xl text-gray-600 mb-2">
                      {getHintDescription(currentGuess.hint, locale)}
                    </div>
                    <div className="text-base text-gray-500">
                      {locale === 'zh' ? '实际距离：' : 'Distance: '}
                      <span className="font-semibold">{formatDistance(currentGuess.distance)}</span>
                    </div>
                    <button
                      onClick={() => setCurrentGuess(null)}
                      className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      {locale === 'zh' ? '继续猜测' : 'Try Again'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Round Over Panel */}
            {isRoundOver && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 shadow-2xl"
                style={{ zIndex: MAP_LAYER.overlay }}
              >
                <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                      {currentRound.solved ? (
                        <>
                          <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                            {locale === 'zh' ? '🎉 找到了！' : '🎉 Found it!'}
                          </div>
                          <div className="text-xl md:text-2xl text-gray-700 mb-1">
                            {locale === 'zh' ? '用了 ' : 'Solved in '}
                            <span className="font-bold">{currentRound.guesses.length}</span>
                            {locale === 'zh' ? ' 次尝试' : ' attempts'}
                          </div>
                          <div className="text-lg md:text-xl text-orange-600">
                            {locale === 'zh' ? '得分：' : 'Score: '}
                            <span className="font-bold">
                              +{currentRound.score} {locale === 'zh' ? '分' : 'pts'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl md:text-4xl font-bold text-gray-700 mb-2">
                            {locale === 'zh' ? '😅 次数用完了' : '😅 Out of attempts'}
                          </div>
                          <div className="text-xl text-gray-600">
                            {locale === 'zh'
                              ? '正确位置已显示在地图上'
                              : 'The correct location is shown on the map'}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={nextRound}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg hover:shadow-xl"
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
              {locale === 'zh' ? '🎉 游戏结束！' : '🎉 Game Over!'}
            </h1>
            <p className="text-center text-gray-600 text-lg mb-8">
              {locale === 'zh' ? '你的最终成绩' : 'Your Final Score'}
            </p>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 mb-8 text-center">
              <div className="text-6xl md:text-7xl font-bold mb-2">{stats.totalScore}</div>
              <div className="text-2xl opacity-90">
                / {HOTCOLD_CONFIG.totalRounds * ATTEMPT_SCORES[1]}{' '}
                {locale === 'zh' ? '分' : 'points'}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.solvedRounds} / {stats.totalRounds}
                </div>
                <div className="text-gray-600">
                  {locale === 'zh' ? '找到的地点' : 'Sites Found'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {stats.successRate}% {locale === 'zh' ? '成功率' : 'Success Rate'}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.averageAttempts.toFixed(1)}
                </div>
                <div className="text-gray-600">
                  {locale === 'zh' ? '平均尝试次数' : 'Avg Attempts'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ({stats.totalAttempts} {locale === 'zh' ? '总尝试' : 'total'})
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.firstAttemptSolves}
                </div>
                <div className="text-gray-600">
                  {locale === 'zh' ? '一次成功' : 'First Try Wins'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ({locale === 'zh' ? '满分回合' : 'perfect rounds'})
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
