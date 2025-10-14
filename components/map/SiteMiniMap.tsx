'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Reuse default marker fix to ensure icons render in Next.js bundler context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== 'undefined' && !(L.Icon.Default.prototype as any)._iconUrl) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

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
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
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
    }).addTo(map)

    L.marker([latitude, longitude]).addTo(map).bindPopup(name)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, name, zoom])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([latitude, longitude], zoom)
  }, [latitude, longitude, zoom])

  return <div ref={containerRef} className={`w-full h-full rounded-lg ${className}`} />
}
