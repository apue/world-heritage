'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { GeoRound } from '@/lib/games/types'
import type { Locale } from '@/lib/i18n/config'

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

const guessIcon = createIcon('#3B82F6', '📍')
const answerIcon = createIcon('#10B981', '✓')

interface GeoGameMapProps {
  currentRound: GeoRound
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

export default function GeoGameMap({ currentRound, onGuess, showAnswer, locale }: GeoGameMapProps) {
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

  const userGuess = currentRound.userGuess
  const actualLocation = currentRound.site

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="w-full h-full cursor-crosshair"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onGuess={onGuess} disabled={showAnswer} />

      {/* User's guess marker */}
      {userGuess && <Marker position={[userGuess.lat, userGuess.lng]} icon={guessIcon} />}

      {/* Actual location marker (only show after guess) */}
      {showAnswer && (
        <>
          <Marker
            position={[actualLocation.latitude, actualLocation.longitude]}
            icon={answerIcon}
          />

          {/* Line connecting guess to actual location */}
          {userGuess && (
            <Polyline
              positions={[
                [userGuess.lat, userGuess.lng],
                [actualLocation.latitude, actualLocation.longitude],
              ]}
              color="#EF4444"
              weight={3}
              dashArray="10, 10"
            />
          )}
        </>
      )}
    </MapContainer>
  )
}
