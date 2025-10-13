/**
 * Map abstraction layer types
 * Provides a unified interface for different map providers
 */

export interface LatLng {
  lat: number
  lng: number
}

export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

export interface MarkerConfig {
  id: string
  position: LatLng
  title?: string
  icon?: string
  onClick?: () => void
}

export interface MapEvents {
  onClick?: (position: LatLng) => void
  onZoomChange?: (zoom: number) => void
  onBoundsChange?: (bounds: Bounds) => void
}

export type MapStyle = 'default' | 'satellite' | 'terrain' | 'dark'

export interface MapConfig {
  center: LatLng
  zoom: number
  minZoom?: number
  maxZoom?: number
  markers?: MarkerConfig[]
  events?: MapEvents
  style?: MapStyle
}

export interface IMapAdapter {
  initialize(container: HTMLElement, config: MapConfig): void
  destroy(): void
  setCenter(position: LatLng): void
  setZoom(zoom: number): void
  fitBounds(bounds: Bounds): void
  addMarker(marker: MarkerConfig): string
  removeMarker(markerId: string): void
  clearMarkers(): void
  on(event: string, handler: (...args: any[]) => void): void
  off(event: string, handler: (...args: any[]) => void): void
  getCenter(): LatLng
  getZoom(): number
  getBounds(): Bounds
}

export type MapProvider = 'leaflet' | 'mapbox' | 'google' | 'maplibre'
