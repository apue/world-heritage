'use client'

/**
 * Interactive map component for displaying World Heritage Sites
 * Uses Leaflet with marker clustering for performance
 * Supports custom colored markers based on user site status
 */

import { useEffect, useRef } from 'react'
import { createRoot, Root } from 'react-dom/client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { HeritageSite } from '@/lib/data/types'
import { Locale } from '@/lib/i18n/config'
import { useUserSites } from '@/lib/contexts/UserSitesContext'
import { SITE_STATUS_COLORS, getPrimaryStatus } from '@/lib/design/site-status-colors'
import type { SiteStatusType } from '@/lib/design/site-status-colors'
import SiteActionButtons from '@/components/heritage/SiteActionButtons'

interface HeritageMapProps {
  sites: HeritageSite[]
  locale: Locale
  selectedSite?: HeritageSite | null
  onMarkerClick?: (site: HeritageSite) => void
  className?: string
}

const popupCopy = {
  en: {
    viewDetails: 'Details',
  },
  zh: {
    viewDetails: '详情',
  },
} satisfies Record<Locale, Record<string, string>>

/**
 * Create custom marker icon based on site status
 */
function createCustomMarkerIcon(statusType: SiteStatusType): L.DivIcon {
  const colors = SITE_STATUS_COLORS[statusType]

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <div style="
          position: absolute;
          width: 28px;
          height: 28px;
          background-color: ${colors.primary};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">${colors.icon}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'custom-marker-icon',
  })
}

/**
 * Create popup HTML with container for React buttons
 */
function createPopupContent(site: HeritageSite, locale: Locale): string {
  const translation = site.translations[locale] ?? site.translations.en
  const copy = popupCopy[locale]

  return `
    <div style="width: 280px;">
      <!-- Hero Image (full width, no padding) -->
      <div class="relative h-28 w-full overflow-hidden">
        <img
          src="${site.imageUrl}"
          alt="${translation.name}"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Content with padding -->
      <div class="p-3">
        <!-- Site Name -->
        <h3 class="mb-2 text-sm font-bold leading-tight">${translation.name}</h3>

        <!-- Category + View Details (same row) -->
        <div class="mb-2 flex items-center justify-between">
          <span class="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
            ${site.category}
          </span>
          <a
            href="/${locale}/heritage/${site.id}"
            class="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            ${copy.viewDetails}
            <svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
            </svg>
          </a>
        </div>

        <!-- Action Buttons Container (React will render here) -->
        <div id="popup-actions-${site.id}" class="popup-actions-container"></div>
      </div>
    </div>
  `
}

export default function HeritageMap({
  sites,
  locale,
  selectedSite,
  onMarkerClick,
  className = '',
}: HeritageMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.MarkerClusterGroup | null>(null)
  const markerInstancesRef = useRef<Map<string, L.Marker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const reactRootsRef = useRef<Map<string, Root>>(new Map())

  const { getSiteStatus, sitesStatus } = useUserSites()

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Create map
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
    })

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Cleanup React roots when component unmounts
  useEffect(() => {
    return () => {
      reactRootsRef.current.forEach((root) => {
        root.unmount()
      })
      reactRootsRef.current.clear()
    }
  }, [])

  // Update markers when sites or user status changes
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current)
    }
    markerInstancesRef.current.clear()

    // Cleanup old React roots
    reactRootsRef.current.forEach((root) => {
      root.unmount()
    })
    reactRootsRef.current.clear()

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    })

    // Add markers for each site
    sites.forEach((site) => {
      const siteStatus = getSiteStatus(site.id)
      const statusType = getPrimaryStatus(siteStatus)
      const customIcon = createCustomMarkerIcon(statusType)

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon })

      // Create popup content
      const popupContent = createPopupContent(site, locale)

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
        autoPan: true,
        closeButton: true,
      })

      // Render React component when popup opens
      marker.on('popupopen', () => {
        const container = document.getElementById(`popup-actions-${site.id}`)
        if (container && !reactRootsRef.current.has(site.id)) {
          const root = createRoot(container)
          root.render(<SiteActionButtons siteId={site.id} variant="popup" locale={locale} />)
          reactRootsRef.current.set(site.id, root)
        }
      })

      // Cleanup React root when popup closes
      marker.on('popupclose', () => {
        const root = reactRootsRef.current.get(site.id)
        if (root) {
          root.unmount()
          reactRootsRef.current.delete(site.id)
        }
      })

      // Handle marker click
      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(site)
        })
      }

      markers.addLayer(marker)
      markerInstancesRef.current.set(site.id, marker)
    })

    mapRef.current.addLayer(markers)
    markersRef.current = markers

    // Fit bounds if there are sites
    if (sites.length > 0) {
      const bounds = markers.getBounds()
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [sites, locale, onMarkerClick, getSiteStatus, sitesStatus])

  // Handle selected site
  useEffect(() => {
    if (!mapRef.current || !selectedSite) return

    // Center map on selected site
    mapRef.current.setView([selectedSite.latitude, selectedSite.longitude], 10, {
      animate: true,
    })

    // Open popup for selected site
    const marker = markerInstancesRef.current.get(selectedSite.id)
    if (marker) {
      marker.openPopup()
    }
  }, [selectedSite])

  return <div ref={containerRef} className={`w-full h-full ${className}`} />
}
