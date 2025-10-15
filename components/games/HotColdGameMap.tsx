'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { HotColdRound } from '@/lib/games/types'
import type { Locale } from '@/lib/i18n/config'
import { getTemperatureEmoji } from '@/lib/games/hotcold-utils'

// Fix for default marker icons in Next.js
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const createIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

const answerIcon = createIcon('#10B981', '✓')

// Create small numbered marker for guess history
const createSmallIcon = (number: number, emoji: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: #6B7280;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-weight: bold;
        color: white;
        line-height: 1;
      ">
        <div style="font-size: 12px;">${emoji}</div>
        <div style="font-size: 9px; margin-top: -2px;">${number}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

interface HotColdGameMapProps {
  currentRound: HotColdRound
  onGuess: (lat: number, lng: number) => void
  showAnswer: boolean
  locale: Locale
}

// Map click handler component
function MapClickHandler({
  onGuess,
  disabled,
}: {
  onGuess: (lat: number, lng: number) => void
  disabled: boolean
}) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onGuess(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export default function HotColdGameMap({
  currentRound,
  onGuess,
  showAnswer,
  locale,
}: HotColdGameMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">{locale === 'zh' ? '加载地图中...' : 'Loading map...'}</div>
      </div>
    )
  }

  const actualLocation = currentRound.site
  const guesses = currentRound.guesses

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="w-full h-full leaflet-crosshair"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onGuess={onGuess} disabled={showAnswer} />

      {/* Historical guess markers */}
      {guesses.map((guess, index) => (
        <Marker
          key={index}
          position={[guess.lat, guess.lng]}
          icon={createSmallIcon(guess.attemptNumber, getTemperatureEmoji(guess.hint))}
        />
      ))}

      {/* Lines from guesses to actual location (only after solved or game over) */}
      {showAnswer &&
        guesses.map((guess, index) => (
          <Polyline
            key={`line-${index}`}
            positions={[
              [guess.lat, guess.lng],
              [actualLocation.latitude, actualLocation.longitude],
            ]}
            color="#9CA3AF"
            weight={2}
            dashArray="5, 5"
            opacity={0.5}
          />
        ))}

      {/* Actual location marker (only show after solved or max attempts reached) */}
      {showAnswer && (
        <Marker position={[actualLocation.latitude, actualLocation.longitude]} icon={answerIcon} />
      )}
    </MapContainer>
  )
}
