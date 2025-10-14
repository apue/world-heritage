'use client'

import { useEffect, useRef } from 'react'
import type { Map } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface SiteMiniMapProps {
  latitude: number
  longitude: number
  name: string
  zoom?: number
  className?: string
}

export default function SiteMiniMap({
  latitude,
  longitude,
  name,
  zoom = 6,
  className = '',
}: SiteMiniMapProps) {
  const mapRef = useRef<Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    let mapInstance: Map | null = null

    const initMap = async () => {
      const { default: L } = await import('leaflet')

      if (!isMounted || !containerRef.current) return

      const iconPrototype = L.Icon.Default.prototype as unknown as {
        _getIconUrl?: () => string
        _iconUrl?: string
      }
      if (typeof window !== 'undefined' && !iconPrototype._iconUrl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      }

      mapInstance = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom,
        minZoom: 2,
        maxZoom: 16,
        scrollWheelZoom: false,
        dragging: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance)

      L.marker([latitude, longitude]).addTo(mapInstance).bindPopup(name)

      mapRef.current = mapInstance
    }

    initMap().catch((error) => {
      console.error('Failed to initialize mini map', error)
    })

    return () => {
      isMounted = false
      mapInstance?.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, name, zoom])

  return <div ref={containerRef} className={`w-full h-full rounded-lg ${className}`} />
}
