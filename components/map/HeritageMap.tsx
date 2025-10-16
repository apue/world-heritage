'use client'

/**
 * Interactive map component for displaying World Heritage Sites
 * Uses Leaflet with marker clustering for performance
 * Supports custom colored markers based on user site status
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
 * Uses inline styles to ensure compatibility (Tailwind classes in string templates are not compiled)
 */
function createPopupContent(site: HeritageSite, locale: Locale): string {
  const translation = site.translations[locale] ?? site.translations.en
  const copy = popupCopy[locale]

  return `
    <div style="width: 280px;">
      <!-- Hero Image (full width, no padding) -->
      <div style="position: relative; height: 112px; width: 100%; overflow: hidden;">
        <img
          src="${site.imageUrl}"
          alt="${translation.name}"
          style="height: 100%; width: 100%; object-fit: cover;"
          loading="lazy"
        />
      </div>

      <!-- Content with padding -->
      <div style="padding: 0.75rem;">
        <!-- Site Name -->
        <h3 style="margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 700; line-height: 1.25;">
          ${translation.name}
        </h3>

        <!-- Category + View Details (same row) -->
        <div style="margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: inline-block; border-radius: 0.25rem; background-color: #dbeafe; padding: 0.125rem 0.5rem; font-size: 0.75rem; color: #1e40af;">
            ${site.category}
          </span>
          <a
            href="/${locale}/heritage/${site.id}"
            style="display: inline-flex; align-items: center; font-size: 0.75rem; font-weight: 500; color: #2563eb; text-decoration: none;"
            onmouseover="this.style.color='#1d4ed8'"
            onmouseout="this.style.color='#2563eb'"
          >
            ${copy.viewDetails}
            <svg style="margin-left: 0.25rem; height: 0.75rem; width: 0.75rem;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
            </svg>
          </a>
        </div>

        <!-- Action Buttons Container (React will render here) -->
        <div id="popup-actions-${site.id}"></div>
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
  const markerToSiteIdRef = useRef<Map<L.Marker, string>>(new Map())
  const markerPrimaryStatusRef = useRef<Map<string, SiteStatusType>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [openSiteId, setOpenSiteId] = useState<string | null>(null)
  const hasFittedRef = useRef<boolean>(false)
  const openSiteIdRef = useRef<string | null>(null)
  const selectionByMarkerRef = useRef<boolean>(false)

  // Lightweight FIFO queue for icon updates
  type UpdateTask = { siteId: string }
  const taskQueueRef = useRef<UpdateTask[]>([])
  const processingRef = useRef<boolean>(false)
  // Site update states: Idle | PopupOpen | PendingUpdate
  const siteUpdateStateRef = useRef<Map<string, 'Idle' | 'PopupOpen' | 'PendingUpdate'>>(new Map())

  function enqueueUpdate(siteId: string) {
    taskQueueRef.current.push({ siteId })
    processQueue()
  }

  function processQueue() {
    if (processingRef.current) return
    processingRef.current = true
    while (taskQueueRef.current.length > 0) {
      const task = taskQueueRef.current.shift()!
      const marker = markerInstancesRef.current.get(task.siteId)
      if (!marker) continue
      const status = getSiteStatus(task.siteId)
      const newType = getPrimaryStatus(status)
      const oldType = markerPrimaryStatusRef.current.get(task.siteId)
      if (newType !== oldType) {
        marker.setIcon(createCustomMarkerIcon(newType))
        markerPrimaryStatusRef.current.set(task.siteId, newType)
        if (markersRef.current) {
          const m = markersRef.current as unknown as { refreshClusters?: (layer?: L.Layer) => void }
          m.refreshClusters?.(marker)
        }
      }
      siteUpdateStateRef.current.set(task.siteId, 'Idle')
    }
    processingRef.current = false
  }

  function scheduleUpdateForSite(siteId: string) {
    const state = siteUpdateStateRef.current.get(siteId) || 'Idle'
    if (state === 'PopupOpen') {
      siteUpdateStateRef.current.set(siteId, 'PendingUpdate')
      return
    }
    enqueueUpdate(siteId)
  }

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

  // Rebuild markers when sites or locale change (NOT on status change)
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing markers
    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current)
    }
    markerInstancesRef.current.clear()
    markerPrimaryStatusRef.current.clear()
    setPortalTarget(null)
    setOpenSiteId(null)

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
    })

    // Custom cluster click behavior:
    // - If cluster has >1 markers: spiderfy (no zoom change)
    // - If cluster has exactly 1 marker: open its popup (no zoom change)
    markers.on('clusterclick', (e: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const evt = e as any
      const cluster = evt?.layer
      if (!cluster || typeof cluster.getChildCount !== 'function') return
      const count = cluster.getChildCount()
      if (count === 1 && typeof cluster.getAllChildMarkers === 'function') {
        const children = cluster.getAllChildMarkers()
        const marker = children?.[0]
        if (marker && typeof marker.openPopup === 'function') {
          marker.openPopup()
        }
      } else if (count > 1 && count < 5 && typeof cluster.spiderfy === 'function') {
        // 少量子标记时使用蜘蛛化展开（不改变缩放）
        cluster.spiderfy()
      } else if (count >= 5) {
        // 子标记较多时使用 fitBounds 到聚合范围
        const bounds = typeof cluster.getBounds === 'function'
          ? cluster.getBounds()
          : new L.LatLngBounds(
              (typeof cluster.getAllChildMarkers === 'function'
                ? cluster.getAllChildMarkers()
                : []
              ).map((m: L.Marker) => m.getLatLng())
            )
        if (bounds && bounds.isValid && bounds.isValid() && mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        }
      }
      const oe = evt?.originalEvent
      oe?.preventDefault?.()
      oe?.stopPropagation?.()
    })

    // Map-level popup lifecycle listeners (derive siteId from popup source)
    mapRef.current.on('popupopen', (e: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const evt = e as any
      const src: L.Marker | undefined = evt?.popup?._source
      if (!src) return
      const sid = markerToSiteIdRef.current.get(src)
      if (!sid) return
      openSiteIdRef.current = sid
      setOpenSiteId(sid)
      setTimeout(() => {
        const container = document.getElementById(`popup-actions-${sid}`)
        if (container) setPortalTarget(container)
        siteUpdateStateRef.current.set(sid, 'PopupOpen')
      }, 0)
    })

    mapRef.current.on('popupclose', (e: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const evt = e as any
      const src: L.Marker | undefined = evt?.popup?._source
      if (!src) return
      const sid = markerToSiteIdRef.current.get(src)
      if (!sid) return
      const state = siteUpdateStateRef.current.get(sid)
      if (state === 'PendingUpdate') {
        enqueueUpdate(sid)
      }
      siteUpdateStateRef.current.set(sid, 'Idle')
      if (openSiteIdRef.current === sid) {
        openSiteIdRef.current = null
        setOpenSiteId(null)
        setPortalTarget(null)
      }
    })

    // Add markers for each site
    sites.forEach((site) => {
      // Initial icon uses current status snapshot; later updates handled by a separate effect
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

      // Track marker ↔ siteId mapping
      markerToSiteIdRef.current.set(marker, site.id)

      // Handle marker click
      if (onMarkerClick) {
        marker.on('click', () => {
          selectionByMarkerRef.current = true
          onMarkerClick(site)
        })
      }

      markers.addLayer(marker)
      markerInstancesRef.current.set(site.id, marker)
      markerPrimaryStatusRef.current.set(site.id, statusType)
      siteUpdateStateRef.current.set(site.id, 'Idle')
    })

    mapRef.current.addLayer(markers)
    markersRef.current = markers

    // Fit bounds if there are sites
    if (sites.length > 0) {
      const bounds = markers.getBounds()
      if (bounds.isValid()) {
        // Only fit on rebuild; do not run on status updates (this effect doesn't run on status)
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        hasFittedRef.current = true
      }
    }
  }, [sites, locale, onMarkerClick])

  // Update marker icons when user status changes (use queue; defer if popup open)
  useEffect(() => {
    if (!mapRef.current) return
    markerInstancesRef.current.forEach((_, siteId) => {
      const status = getSiteStatus(siteId)
      const newType = getPrimaryStatus(status)
      const oldType = markerPrimaryStatusRef.current.get(siteId)
      if (newType !== oldType) {
        scheduleUpdateForSite(siteId)
      }
    })
  }, [sitesStatus, getSiteStatus])

  // Handle selected site (only programmatic selections should change zoom)
  useEffect(() => {
    if (!mapRef.current || !selectedSite) return
    const map = mapRef.current
    if (selectionByMarkerRef.current) {
      // Marker click: do not change zoom; optional pan only
      map.panTo([selectedSite.latitude, selectedSite.longitude], { animate: true })
    } else {
      // Programmatic (sidebar) selection: set view with desired zoom
      map.setView([selectedSite.latitude, selectedSite.longitude], 10, { animate: true })
    }
    selectionByMarkerRef.current = false

    // Open popup for selected site
    const marker = markerInstancesRef.current.get(selectedSite.id)
    if (marker) {
      marker.openPopup()
    }
  }, [selectedSite])

  const portal = portalTarget && openSiteId
    ? createPortal(
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
          }}
        >
          <SiteActionButtons siteId={openSiteId} variant="popup" locale={locale} />
        </div>,
        portalTarget
      )
    : null

  return (
    <>
      <div ref={containerRef} className={`w-full h-full ${className}`} />
      {portal}
    </>
  )
}
