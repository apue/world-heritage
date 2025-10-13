import type { MapProvider } from '@/lib/maps/types'

export const mapConfig = {
  // Global map provider selection
  provider: (process.env.NEXT_PUBLIC_MAP_PROVIDER || 'leaflet') as MapProvider,

  // Default map configuration
  defaults: {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
    style: 'default' as const,
  },

  // API Keys (for future use with commercial providers)
  apiKeys: {
    mapbox: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    google: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  },
}
