# World Heritage Data Processing Pipeline

This directory contains scripts for processing UNESCO World Heritage Site data and integrating additional geographic information from WDPA.

## 📁 Directory Structure

```
scripts/data-pipeline/
├── 1_extract_wdpa.py      # Python: Extract WDPA data
├── 2_merge_unesco.ts      # TypeScript: Merge all data sources
├── run-all.sh             # Bash: Run complete pipeline
└── README.md              # This file
```

## 🔄 Pipeline Overview

### Stage 1: WDPA Extraction (Python)

**Script**: `1_extract_wdpa.py`

**Input**:

- `data/raw/WDPA_Oct2025_Public_csv.csv` (World Database on Protected Areas)
- `data/sites.json` (UNESCO sites from Stage 2, for matching)

**Output**:

- `data/processed/components.json` - Site components (currently empty, see limitations below)
- `data/processed/wdpa-mapping.json` - Mapping between WDPA names and UNESCO IDs

**What it does**:

1. Reads 305K+ rows from WDPA CSV
2. Filters for World Heritage Sites (~266 entries)
3. Matches WDPA sites to UNESCO IDs using fuzzy matching
4. Exports mapping and component data

### Stage 2: UNESCO Data Merge (TypeScript)

**Script**: `2_merge_unesco.ts`

**Input**:

- `data/raw/whc-en.xml` (UNESCO English data)
- `data/raw/whc-zh.xml` (UNESCO Chinese data)
- `data/processed/components.json` (from Stage 1)

**Output**:

- `data/sites.json` - Final merged dataset with all translations and components

**What it does**:

1. Parses UNESCO XML files
2. Merges multilingual translations
3. Integrates component data (if available)
4. Validates and exports final JSON

## 🚀 Usage

### Quick Start

Run the complete pipeline:

```bash
npm run prepare:data:full
```

Or run individual stages:

```bash
# Stage 1: Extract WDPA data
npm run prepare:wdpa

# Stage 2: Merge UNESCO data
npm run prepare:merge
```

### Legacy Mode (UNESCO only, no WDPA)

```bash
npm run prepare:data
```

This runs the original `scripts/prepare-data.ts` which only processes UNESCO XML files.

## 📊 Data Sources

### 1. UNESCO World Heritage Data

**Source**: https://whc.unesco.org/en/syndication/

**Files**:

- `data/raw/whc-en.xml` - English translations
- `data/raw/whc-zh.xml` - Chinese translations

**Update Frequency**: ~1-2 times per year (when new sites are added)

**Coverage**: 1,247+ sites with full metadata

### 2. WDPA (World Database on Protected Areas)

**Source**: https://www.protectedplanet.net/

**Files**:

- `data/raw/WDPA_Oct2025_Public_csv.csv` - CSV format (125MB)
- ~~`WDPA_shapefile.zip` - Shapefile format (for component boundaries)~~ _(not yet implemented)_

**Update Frequency**: Monthly

**Coverage**: 305K+ protected areas including 266 World Heritage Sites

## ⚠️ Current Limitations

### Component Data Not Available

**Issue**: The WDPA CSV format does not include component-level data for serial/transboundary properties.

**Example**: The Great Wall (ID 438) appears as a single row in WDPA CSV, but UNESCO shows it has 3 component locations on their website.

**Why?**:

- **CSV format**: Contains one row per site (aggregate data only)
- **Shapefile format**: Contains multiple polygons per site (component boundaries)

**Impact**:

- Current pipeline outputs `0 sites with multiple components`
- The `components` field in `sites.json` remains empty

### Solution (Future)

To get component-level data, we need to:

1. **Download WDPA Shapefile** (instead of CSV)
   - Available at: https://www.protectedplanet.net/
   - Format: `.shp` (requires GIS library to process)

2. **Process Shapefile with GIS tools**
   - Use Python's `geopandas` library
   - Extract individual polygons for each site
   - Calculate centroid coordinates for each component

3. **Extract Component Information**
   - Component names (if available in attributes)
   - Polygon boundaries (GeoJSON format)
   - Area calculations
   - Centroid coordinates

**Example Implementation** (not yet added):

```python
# Future: scripts/data-pipeline/1b_extract_shapefile.py

import geopandas as gpd

# Load WDPA shapefile
wdpa = gpd.read_file("data/raw/WDPA_shapefile.shp")

# Filter World Heritage Sites
whs = wdpa[wdpa['DESIG_ENG'] == 'World Heritage Site (natural or mixed)']

# Group by parent site
for parent_id, group in whs.groupby('WDPAID'):
    components = []
    for idx, row in group.iterrows():
        # Extract component info
        component = {
            'name': row['NAME'],
            'geometry': row['geometry'],
            'centroid': row['geometry'].centroid,
            'area_km2': row['REP_AREA']
        }
        components.append(component)

    # Save components for this site
    # ...
```

## 📝 Data Schema

### Final Output: `data/sites.json`

```typescript
interface HeritageSite {
  id: string
  idNumber: string
  uniqueNumber: string

  // Geography
  latitude: number
  longitude: number
  region: string
  isoCodes: string[]

  // Classification
  category: 'Cultural' | 'Natural' | 'Mixed'
  criteriaText: string

  // Status
  dateInscribed: number
  danger: boolean
  transboundary: boolean

  // Multilingual content
  translations: {
    en: { name, description, location, ... }
    zh: { name, description, location, ... }
  }

  // Components (optional, currently empty)
  hasComponents?: boolean
  componentCount?: number
  components?: ComponentSite[]
}

interface ComponentSite {
  componentId: string        // WDPA Parcel ID
  parentId: string           // Parent site ID
  name: {
    en: string
    zh: string
  }
  latitude?: number          // Requires shapefile
  longitude?: number         // Requires shapefile
  area?: number              // Available in CSV
  designation?: string
}
```

## 🔧 Requirements

### Python (for WDPA processing)

**Managed with `uv`**: https://github.com/astral-sh/uv

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync
```

**Dependencies** (in `pyproject.toml`):

- `pandas>=2.2.0` - CSV processing
- ~~`geopandas>=0.14.0` - Shapefile processing~~ _(not yet needed)_

### Node.js (for UNESCO processing)

```bash
npm install
```

**Dependencies**:

- `xml2js` - XML parsing
- `tsx` - TypeScript execution

## 🔄 Update Workflow

### Monthly WDPA Update (Optional)

1. Download latest WDPA CSV:

   ```bash
   # Visit: https://www.protectedplanet.net/
   # Download: WDPA_Public_csv.zip
   # Extract to: data/raw/WDPA_MMYYYY_Public_csv.csv
   ```

2. Run pipeline:

   ```bash
   npm run prepare:data:full
   ```

3. Review changes:
   ```bash
   git diff data/sites.json
   ```

### Annual UNESCO Update

1. Download latest UNESCO XML:

   ```bash
   # Visit: https://whc.unesco.org/en/syndication/
   # Download: whc-sites-YYYY.xml (English)
   # Download: whc-sites-YYYY.xml?locale=zh (Chinese)
   # Rename and place in: data/raw/
   ```

2. Run pipeline:
   ```bash
   npm run prepare:data:full
   ```

## 📈 Future Enhancements

- [ ] **Shapefile Processing** - Add component-level geographic data
- [ ] **Image URLs** - Scrape or integrate Wikimedia Commons images
- [ ] **UNESCO Criteria Parsing** - Extract individual criteria (i, ii, iii, etc.)
- [ ] **Danger Period Tracking** - Parse structured danger period data
- [ ] **Historical Changes** - Track site additions/removals over time
- [ ] **Automated Updates** - GitHub Actions workflow for monthly WDPA updates

## 🐛 Known Issues

1. **Name Matching**: 8 WDPA sites remain unmatched to UNESCO IDs
   - Requires manual mapping or improved fuzzy matching
   - See: `data/processed/wdpa-mapping.json`

2. **Missing Translations**: Some sites lack Chinese translations
   - UNESCO doesn't provide translations for all sites
   - Non-critical: fallback to English in app

3. **Component Data**: Currently empty (see Limitations section)

## 📚 References

- [UNESCO World Heritage Centre](https://whc.unesco.org/)
- [Protected Planet (WDPA)](https://www.protectedplanet.net/)
- [WDPA User Manual](https://www.protectedplanet.net/en/resources)
- [UNESCO Syndication Feed](https://whc.unesco.org/en/syndication/)

---

**Last Updated**: 2025-10-14
