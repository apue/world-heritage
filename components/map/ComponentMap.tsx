'use client'

/**
 * ComponentMap - Map displaying component sites with clustering
 * Used in detail pages for serial properties
 */

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
  MarkerClusterGroupOptions,
  LatLngBounds,
} from 'leaflet'
import type { ComponentSite } from '@/lib/data/types'
import type { Locale } from '@/lib/i18n/config'

interface ComponentMapProps {
  components: ComponentSite[]
  visitedComponentIds: string[]
  selectedComponentId?: string | null
  onComponentClick?: (componentId: string) => void
  onSelectComponent?: (componentId: string) => void // Legacy prop name support
  locale: Locale
  className?: string
}

export default function ComponentMap({
  components,
  visitedComponentIds,
  selectedComponentId,
  onComponentClick,
  onSelectComponent,
  locale,
  className = '',
}: ComponentMapProps) {
  // Support both prop names
  const handleClick = onComponentClick || onSelectComponent
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarkerClusterGroup | null>(null)
  const markerInstancesRef = useRef<Map<string, LeafletMarker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const visitedSet = new Set(visitedComponentIds)

  // Initialize map
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { default: L } = await import('leaflet')
      if (typeof window !== 'undefined') {
        ;(window as typeof window & { L?: typeof L }).L = L
      }
      await import('leaflet.markercluster')
      leafletRef.current = L

      if (cancelled || mapRef.current || !containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      setMapReady(true)
    }

    init().catch((error) => {
      console.error('[ComponentMap] Failed to initialise map', error)
    })

    return () => {
      cancelled = true
      const mapSnapshot = mapRef.current
      const clusterSnapshot = markersRef.current

      if (mapSnapshot && clusterSnapshot) {
        mapSnapshot.removeLayer(clusterSnapshot)
      }
      clusterSnapshot?.remove()
      markersRef.current = null

      markerInstancesRef.current.clear()

      mapSnapshot?.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  // Add component markers
  useEffect(() => {
    const L = leafletRef.current
    if (!mapReady || !mapRef.current || !L || components.length === 0) return

    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current)
    }
    markerInstancesRef.current.clear()

    type LeafletWithCluster = typeof import('leaflet') & {
      markerClusterGroup: (options?: MarkerClusterGroupOptions) => LeafletMarkerClusterGroup
    }
    const leafletWithCluster = L as LeafletWithCluster
    const markers = leafletWithCluster.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    })

    components.forEach((component) => {
      const isVisited = visitedSet.has(component.componentId)
      const componentName = component.name[locale] ?? component.name.en ?? component.componentId

      // Create marker icon based on visited status
      const iconColor = isVisited ? '#10b981' : '#3b82f6' // emerald-500 : blue-500
      const icon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
          ">
            <div style="
              position: absolute;
              width: 24px;
              height: 24px;
              background-color: ${iconColor};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            ">${isVisited ? '✓' : '•'}</div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
        className: 'component-marker-icon',
      })

      const marker = L.marker([component.latitude, component.longitude], { icon })

      marker.bindPopup(
        `
        <div style="min-width: 200px;">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">${componentName}</p>
          <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">${component.componentId}</p>
          <p style="font-size: 0.75rem; color: #6b7280;">
            ${component.latitude.toFixed(3)}, ${component.longitude.toFixed(3)}
          </p>
          ${
            isVisited
              ? '<p style="margin-top: 0.5rem; font-size: 0.75rem; color: #10b981; font-weight: 600;">✓ Visited</p>'
              : ''
          }
        </div>
      `,
        {
          maxWidth: 300,
          className: 'component-popup',
        }
      )

      if (handleClick) {
        marker.on('click', () => {
          handleClick(component.componentId)
        })
      }

      markers.addLayer(marker)
      markerInstancesRef.current.set(component.componentId, marker)
    })

    mapRef.current.addLayer(markers)
    markersRef.current = markers

    // Fit bounds to show all components
    if (components.length > 0) {
      const bounds = markers.getBounds() as LatLngBounds
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [mapReady, components, visitedSet, locale, handleClick])

  // Handle selected component
  useEffect(() => {
    if (!mapRef.current || !selectedComponentId) return

    const marker = markerInstancesRef.current.get(selectedComponentId)
    if (marker) {
      const map = mapRef.current
      map.setView(marker.getLatLng(), 10, { animate: true })
      marker.openPopup()
    }
  }, [selectedComponentId])

  return <div ref={containerRef} className={`w-full h-full ${className}`} />
}
