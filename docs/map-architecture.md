# Map Architecture

## Overview

This project uses a flexible map abstraction layer that allows easy switching between different map service providers without changing business code.

## Architecture Pattern

We use the **Adapter Pattern** to abstract map providers:

```
Business Components (React)
    ↓
Map Abstraction Layer (IMapAdapter)
    ↓
    ┌───────────┬──────────┬─────────┬──────────┐
    ↓           ↓          ↓         ↓          ↓
Leaflet     Mapbox    Google    MapLibre    (Future)
```

## Supported Providers

### Current Implementation

#### Leaflet + OpenStreetMap (Default)
- **Cost**: Free, unlimited usage
- **Features**: Basic map display, markers, popups
- **Pros**:
  - No API key required
  - No usage limits
  - Open source
  - Good community support
- **Cons**:
  - Limited styling options
  - No satellite imagery by default

### Planned Providers

#### Mapbox
- **Free Tier**: 50,000 map loads/month
- **Cost After**: $5/1000 loads
- **Features**: Beautiful styles, 3D terrain, custom styling
- **Use Case**: When you need advanced visuals

#### Google Maps
- **Free Tier**: $200/month credit (~28,000 loads)
- **Cost After**: $7/1000 loads
- **Features**: Street View, extensive POI data
- **Use Case**: When you need street view or POI data

#### MapLibre
- **Cost**: Free (open source)
- **Features**: Similar to Mapbox, vector tiles
- **Use Case**: When you need advanced features without vendor lock-in

## Switching Providers

To switch map providers, simply update the environment variable:

```bash
# .env.local
NEXT_PUBLIC_MAP_PROVIDER=leaflet  # or mapbox, google, maplibre
```

No code changes required!

## Adding a New Provider

1. Create adapter: `lib/maps/adapters/your-provider.ts`
2. Implement `IMapAdapter` interface
3. Register in `MapFactory.ts`
4. Update environment variable

See `lib/maps/adapters/leaflet.ts` for reference implementation.

## Usage Example

```tsx
import { MapProviderComponent } from '@/lib/maps/MapProvider'
import { mapConfig } from '@/config/map.config'

function MyMap() {
  return (
    <MapProviderComponent
      provider={mapConfig.provider}
      config={{
        center: { lat: 20, lng: 0 },
        zoom: 2,
        markers: [...],
      }}
    />
  )
}
```

## Map Styles

Available styles for all providers:
- `default` - Standard map view
- `dark` - Dark theme
- `terrain` - Topographic view
- `satellite` - Satellite imagery (if supported)

## Future Improvements

- [ ] Clustering for large marker sets
- [ ] Custom marker icons
- [ ] Polyline and polygon support
- [ ] Heat maps
- [ ] 3D terrain support
