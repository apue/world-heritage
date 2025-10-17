'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import type { ComponentSite } from '@/lib/data/types'

interface ComponentMapProps {
  components: ComponentSite[]
  visitedComponentIds: string[]
  selectedComponentId?: string | null
  onSelectComponent?: (componentId: string) => void
  className?: string
}

const VISITED_COLOR = '#10b981'
const DEFAULT_COLOR = '#2563eb'
const SELECTED_BORDER = '#f59e0b'

function createComponentIcon({
  visited,
  selected,
}: {
  visited: boolean
  selected: boolean
}): L.DivIcon {
  const baseColor = visited ? VISITED_COLOR : DEFAULT_COLOR
  const borderColor = selected ? SELECTED_BORDER : 'white'

  return L.divIcon({
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${baseColor};
        border: 3px solid ${borderColor};
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
    className: 'component-marker-icon',
  })
}

export default function ComponentMap({
  components,
  visitedComponentIds,
  selectedComponentId,
  onSelectComponent,
  className = '',
}: ComponentMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  const visitedSet = useMemo(() => new Set(visitedComponentIds), [visitedComponentIds])

  const resetMarkers = useCallback(() => {
    markersRef.current = new Map()
  }, [])

  const buildMarkers = useCallback(() => {
    if (!mapRef.current) return

    if (clusterRef.current) {
      mapRef.current.removeLayer(clusterRef.current)
    }

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
    })

    components.forEach((component) => {
      const lat = component.latitude
      const lon = component.longitude
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return
      }

      const isVisited = visitedSet.has(component.componentId)
      const isSelected = selectedComponentId === component.componentId
      const icon = createComponentIcon({ visited: isVisited, selected: isSelected })

      const marker = L.marker([lat, lon], { icon })
      marker.bindPopup(
        `<div style="font-size: 0.8rem; font-weight: 600;">${component.name.en}</div>`
      )

      marker.on('click', () => {
        onSelectComponent?.(component.componentId)
      })

      cluster.addLayer(marker)
      markersRef.current.set(component.componentId, marker)
    })

    clusterRef.current = cluster
    mapRef.current.addLayer(cluster)

    const markerLatLngs = components
      .map((component) => new L.LatLng(component.latitude, component.longitude))
      .filter((latLng) => Number.isFinite(latLng.lat) && Number.isFinite(latLng.lng))

    if (markerLatLngs.length === 1) {
      mapRef.current.setView(markerLatLngs[0], 9)
    } else if (markerLatLngs.length > 1) {
      const bounds = L.latLngBounds(markerLatLngs)
      mapRef.current.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [components, visitedSet, selectedComponentId, onSelectComponent])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    resetMarkers()
    buildMarkers()
  }, [buildMarkers, resetMarkers])

  useEffect(() => {
    if (!mapRef.current || !selectedComponentId) return
    const marker = markersRef.current.get(selectedComponentId)
    if (marker) {
      const latLng = marker.getLatLng()
      mapRef.current.panTo(latLng, { animate: true })
      marker.openPopup()
    }
  }, [selectedComponentId])

  useEffect(() => {
    return () => {
      clusterRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
      resetMarkers()
    }
  }, [resetMarkers])

  return <div ref={containerRef} className={`h-80 w-full rounded-lg ${className}`} />
}
