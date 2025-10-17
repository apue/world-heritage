'use client'

/**
 * Interactive map component for displaying World Heritage Sites
 * Uses Leaflet with marker clustering for performance
 * Supports custom colored markers based on user site status
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  MarkerCluster as LeafletMarkerCluster,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
  MarkerClusterGroupOptions,
  DivIcon,
  LeafletEvent,
  LatLngBounds,
  PopupEvent,
} from 'leaflet'
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

const popupCopy: Record<
  Locale,
  {
    viewDetails: string
    componentsLabel: string
  }
> = {
  en: {
    viewDetails: 'Details',
    componentsLabel: 'Components',
  },
  zh: {
    viewDetails: '详情',
    componentsLabel: '组成数量',
  },
}

type ClusterClickEvent = LeafletEvent & {
  layer?: LeafletMarkerCluster
  originalEvent?: MouseEvent
}

type PopupEventWithSource = PopupEvent & {
  popup: PopupEvent['popup'] & { _source?: LeafletMarker }
}

function createCustomMarkerIcon(
  leaflet: typeof import('leaflet'),
  statusType: SiteStatusType,
  options: { componentCount?: number } = {}
): DivIcon {
  const colors = SITE_STATUS_COLORS[statusType]
  const componentCount = options.componentCount ?? 0
  const showBadge = componentCount > 0
  const badgeText = componentCount > 99 ? '99+' : componentCount.toString()

  return leaflet.divIcon({
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
        ${
          showBadge
            ? `<span style="
                 position: absolute;
                 top: -6px;
                 right: -6px;
                 min-width: 18px;
                 height: 18px;
                 padding: 0 4px;
                 border-radius: 9999px;
                 background: #1d4ed8;
                 color: white;
                 font-size: 10px;
                 font-weight: 700;
                 text-align: center;
                 line-height: 18px;
                 box-shadow: 0 1px 3px rgba(0,0,0,0.3);
               ">${badgeText}</span>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'custom-marker-icon',
  })
}

function createPopupContent(site: HeritageSite, locale: Locale): string {
  const translation = site.translations[locale] ?? site.translations.en
  const copy = popupCopy[locale]
  const componentCount = site.componentCount ?? site.components?.length ?? 0

  return `
    <div style="width: 280px;">
      <div style="position: relative; height: 112px; width: 100%; overflow: hidden;">
        <img
          src="${site.imageUrl}"
          alt="${translation.name}"
          style="height: 100%; width: 100%; object-fit: cover;"
          loading="lazy"
        />
      </div>

      <div style="padding: 0.75rem;">
        <h3 style="margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 700; line-height: 1.25;">
          ${translation.name}
        </h3>

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

        <div id="popup-actions-${site.id}"></div>
        ${
          componentCount > 0
            ? `<div style="margin-top: 0.75rem; font-size: 0.75rem; color: #4b5563;">
                 ${copy.componentsLabel}: ${componentCount}
               </div>`
            : ''
        }
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
  const mapRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarkerClusterGroup | null>(null)
  const markerInstancesRef = useRef<Map<string, LeafletMarker>>(new Map())
  const markerToSiteIdRef = useRef<Map<LeafletMarker, string>>(new Map())
  const markerPrimaryStatusRef = useRef<Map<string, SiteStatusType>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [openSiteId, setOpenSiteId] = useState<string | null>(null)
  const hasFittedRef = useRef<boolean>(false)
  const openSiteIdRef = useRef<string | null>(null)
  const selectionByMarkerRef = useRef<boolean>(false)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const [mapReady, setMapReady] = useState(false)

  type UpdateTask = { siteId: string }
  const taskQueueRef = useRef<UpdateTask[]>([])
  const processingRef = useRef<boolean>(false)
  const siteLookupRef = useRef<Map<string, HeritageSite>>(new Map())

  const { getSiteStatus, sitesStatus } = useUserSites()
  const getSiteStatusRef = useRef(getSiteStatus)
  useEffect(() => {
    getSiteStatusRef.current = getSiteStatus
  }, [getSiteStatus])

  const ensureLeaflet = useCallback(async () => {
    if (!leafletRef.current) {
      const { default: L } = await import('leaflet')
      if (typeof window !== 'undefined') {
        ;(window as typeof window & { L?: typeof L }).L = L
      }
      await import('leaflet.markercluster')
      leafletRef.current = L
    }
    return leafletRef.current!
  }, [])

  const processQueue = useCallback(() => {
    const L = leafletRef.current
    if (!L || processingRef.current) return
    processingRef.current = true

    const updatedMarkers: LeafletMarker[] = []

    while (taskQueueRef.current.length > 0) {
      const task = taskQueueRef.current.shift()!
      const marker = markerInstancesRef.current.get(task.siteId)
      if (!marker) continue

      const status = getSiteStatusRef.current(task.siteId)
      const newType = getPrimaryStatus(status)
      const oldType = markerPrimaryStatusRef.current.get(task.siteId)

      if (newType !== oldType) {
        const siteData = siteLookupRef.current.get(task.siteId)
        const componentCount = siteData?.componentCount ?? siteData?.components?.length ?? 0
        marker.setIcon(createCustomMarkerIcon(L, newType, { componentCount }))
        markerPrimaryStatusRef.current.set(task.siteId, newType)
        updatedMarkers.push(marker)
      }
    }

    if (updatedMarkers.length > 0 && markersRef.current) {
      type RefreshableCluster = LeafletMarkerClusterGroup & { refreshClusters?: () => void }
      ;(markersRef.current as RefreshableCluster).refreshClusters?.()
    }

    processingRef.current = false
  }, [])

  const enqueueUpdate = useCallback(
    (siteId: string) => {
      taskQueueRef.current.push({ siteId })
      processQueue()
    },
    [processQueue]
  )

  const scheduleUpdateForSite = useCallback(
    (siteId: string) => {
      enqueueUpdate(siteId)
    },
    [enqueueUpdate]
  )

  useEffect(() => {
    const map = new Map<string, HeritageSite>()
    sites.forEach((site) => map.set(site.id, site))
    siteLookupRef.current = map
  }, [sites])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const L = await ensureLeaflet()
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
      console.error('[HeritageMap] Failed to initialise map', error)
    })

    const clusterStore = markersRef
    const markerMapStore = markerInstancesRef
    const markerSiteStore = markerToSiteIdRef
    const markerStatusStore = markerPrimaryStatusRef
    const mapStore = mapRef

    return () => {
      cancelled = true
      const clusterSnapshot = clusterStore.current
      const mapSnapshot = mapStore.current

      if (mapSnapshot && clusterSnapshot) {
        mapSnapshot.removeLayer(clusterSnapshot)
      }
      clusterSnapshot?.remove()
      clusterStore.current = null

      markerMapStore.current.clear()
      markerSiteStore.current.clear()
      markerStatusStore.current.clear()

      mapSnapshot?.remove()
      mapStore.current = null
      setMapReady(false)
    }
  }, [ensureLeaflet])

  useEffect(() => {
    const L = leafletRef.current
    if (!mapReady || !mapRef.current || !L) return

    if (markersRef.current) {
      mapRef.current.removeLayer(markersRef.current)
    }
    markerInstancesRef.current.clear()
    markerPrimaryStatusRef.current.clear()
    setPortalTarget(null)
    setOpenSiteId(null)

    type LeafletWithCluster = typeof import('leaflet') & {
      markerClusterGroup: (options?: MarkerClusterGroupOptions) => LeafletMarkerClusterGroup
    }
    const leafletWithCluster = L as LeafletWithCluster
    const markers = leafletWithCluster.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
    })

    markers.on('clusterclick', (event: ClusterClickEvent) => {
      const cluster = event.layer as LeafletMarkerCluster | undefined
      if (!cluster || typeof cluster.getChildCount !== 'function') return

      const count = cluster.getChildCount()
      if (count === 1 && typeof cluster.getAllChildMarkers === 'function') {
        const childMarkers = cluster.getAllChildMarkers() as LeafletMarker[]
        const marker = childMarkers?.[0]
        if (marker && typeof marker.openPopup === 'function') {
          marker.openPopup()
        }
      } else if (count > 1 && count < 5 && typeof cluster.spiderfy === 'function') {
        cluster.spiderfy()
      } else if (count >= 5) {
        const childMarkers =
          typeof cluster.getAllChildMarkers === 'function'
            ? (cluster.getAllChildMarkers() as LeafletMarker[])
            : []
        if (childMarkers.length > 0 && mapRef.current) {
          const bounds = L.latLngBounds(childMarkers.map((marker) => marker.getLatLng()))
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      }
      event.originalEvent?.preventDefault?.()
      event.originalEvent?.stopPropagation?.()
    })

    mapRef.current.off('popupopen')
    mapRef.current.off('popupclose')

    mapRef.current.on('popupopen', (event: PopupEventWithSource) => {
      const src = event.popup?._source
      if (!src) return
      const sid = markerToSiteIdRef.current.get(src)
      if (!sid) return
      openSiteIdRef.current = sid
      setOpenSiteId(sid)
      setTimeout(() => {
        const container = document.getElementById(`popup-actions-${sid}`)
        if (container) setPortalTarget(container)
      }, 0)
    })

    mapRef.current.on('popupclose', (event: PopupEventWithSource) => {
      const src = event.popup?._source
      if (!src) return
      const sid = markerToSiteIdRef.current.get(src)
      if (!sid) return
      if (openSiteIdRef.current === sid) {
        openSiteIdRef.current = null
        setOpenSiteId(null)
        setPortalTarget(null)
      }
    })

    sites.forEach((site) => {
      const siteStatus = getSiteStatus(site.id)
      const statusType = getPrimaryStatus(siteStatus)
      const componentCount = site.componentCount ?? site.components?.length ?? 0
      const customIcon = createCustomMarkerIcon(L, statusType, { componentCount })

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon })
      const popupContent = createPopupContent(site, locale)

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup',
        autoPan: true,
        closeButton: true,
      })

      markerToSiteIdRef.current.set(marker, site.id)

      if (onMarkerClick) {
        marker.on('click', () => {
          selectionByMarkerRef.current = true
          onMarkerClick(site)
        })
      }

      markers.addLayer(marker)
      markerInstancesRef.current.set(site.id, marker)
      markerPrimaryStatusRef.current.set(site.id, statusType)
    })

    mapRef.current.addLayer(markers)
    markersRef.current = markers

    if (sites.length > 0) {
      const bounds = markers.getBounds() as LatLngBounds
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
        hasFittedRef.current = true
      }
    }
  }, [mapReady, sites, locale, onMarkerClick, enqueueUpdate, getSiteStatus])

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return
    markerInstancesRef.current.forEach((_, siteId) => {
      const status = getSiteStatus(siteId)
      const newType = getPrimaryStatus(status)
      const oldType = markerPrimaryStatusRef.current.get(siteId)
      if (newType !== oldType) {
        scheduleUpdateForSite(siteId)
      }
    })
  }, [sitesStatus, getSiteStatus, scheduleUpdateForSite])

  useEffect(() => {
    if (!mapRef.current || !selectedSite) return
    const map = mapRef.current
    if (selectionByMarkerRef.current) {
      map.panTo([selectedSite.latitude, selectedSite.longitude], { animate: true })
    } else {
      map.setView([selectedSite.latitude, selectedSite.longitude], 10, { animate: true })
    }
    selectionByMarkerRef.current = false

    const marker = markerInstancesRef.current.get(selectedSite.id)
    if (marker) {
      marker.openPopup()
    }
  }, [selectedSite])

  const portal =
    portalTarget && openSiteId
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
