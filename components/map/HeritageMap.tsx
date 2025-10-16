'use client'

/**
 * Interactive map component for displaying World Heritage Sites
 * Uses Leaflet with marker clustering for performance
 * Supports custom colored markers based on user site status
 */

import { useEffect, useRef } from 'react'
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

interface HeritageMapProps {
  sites: HeritageSite[]
  locale: Locale
  selectedSite?: HeritageSite | null
  onMarkerClick?: (site: HeritageSite) => void
  className?: string
}

const popupCopy = {
  en: {
    viewDetails: 'View details',
    visited: 'Visited',
    wishlist: 'Wishlist',
    bookmark: 'Bookmark',
  },
  zh: {
    viewDetails: '查看详情',
    visited: '已访问',
    wishlist: '想去',
    bookmark: '收藏',
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
 * Create popup HTML with action buttons
 */
function createPopupContent(
  site: HeritageSite,
  locale: Locale,
  statusType: SiteStatusType
): string {
  const translation = site.translations[locale] ?? site.translations.en
  const copy = popupCopy[locale]
  const colors = SITE_STATUS_COLORS[statusType]

  return `
    <div class="p-3" style="min-width: 250px;">
      <!-- Hero Image -->
      <div class="relative mb-2 h-32 w-full overflow-hidden rounded">
        <img
          src="${site.imageUrl}"
          alt="${translation.name}"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Site Info -->
      <h3 class="mb-1 text-sm font-bold">${translation.name}</h3>
      <p class="mb-2 text-xs text-gray-600">${translation.states}</p>

      <!-- Status Badge -->
      <div class="mb-2 flex items-center gap-2">
        <span class="inline-block rounded px-2 py-0.5 text-xs" style="
          background-color: ${colors.light};
          color: ${colors.dark};
        ">
          ${colors.icon} ${colors.label}
        </span>
        <span class="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
          ${site.category}
        </span>
      </div>

      <!-- View Details Link -->
      <a
        href="/${locale}/heritage/${site.id}"
        class="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        ${copy.viewDetails}
        <svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
        </svg>
      </a>
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

  // Update markers when sites or user status changes
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current)
    }
    markerInstancesRef.current.clear()

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
      const popupContent = createPopupContent(site, locale, statusType)

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
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
