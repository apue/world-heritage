# Data Processing Pipeline

This document describes the data processing workflow for World Heritage Explorer.

## 📊 Quick Start

### Daily Development (No WDPA needed)

```bash
npm run prepare:data
```

This processes only UNESCO XML files to generate `data/sites.json`.

### Full Pipeline (With WDPA integration)

```bash
npm run prepare:data:full
```

This runs the complete 2-stage pipeline:

1. **Python**: Extract WDPA data → `data/processed/components.json`
2. **TypeScript**: Merge UNESCO + WDPA → `data/sites.json`

## 🏗️ Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Sources                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  UNESCO XML (Annual)              WDPA CSV (Monthly)        │
│  ├── whc-en.xml (1.8MB)          └── WDPA_*.csv (125MB)    │
│  └── whc-zh.xml (1.6MB)                                     │
│           │                                  │              │
│           │                                  │              │
│           ▼                                  ▼              │
├─────────────────────────────────────────────────────────────┤
│                   Processing Stages                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐           ┌────────────────────┐     │
│  │  Stage 1 (Python)│           │ Stage 2 (TypeScript)│    │
│  │  ───────────────│           │ ──────────────────  │    │
│  │  Extract WDPA   │           │  Merge UNESCO       │    │
│  │  components     │──────────▶│  + WDPA data        │    │
│  │                 │           │                     │    │
│  └──────────────────┘           └────────────────────┘     │
│           │                                  │              │
│           ▼                                  ▼              │
│  data/processed/                      data/sites.json      │
│  ├── components.json                  (2.8MB)              │
│  └── wdpa-mapping.json                                     │
│                                              │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │   Next.js App        │
                                    │   (Frontend)         │
                                    └──────────────────────┘
```

### Directory Structure

```
data/
├── raw/                        # Source data (NOT in git)
│   ├── whc-en.xml             # UNESCO English data
│   ├── whc-zh.xml             # UNESCO Chinese data
│   └── WDPA_Oct2025_Public_csv.csv  # WDPA data
├── processed/                  # Intermediate data (NOT in git)
│   ├── components.json        # Extracted components
│   └── wdpa-mapping.json      # WDPA-UNESCO mapping
└── sites.json                  # Final output (IN git, 2.8MB)

scripts/
├── prepare-data.ts             # Legacy: UNESCO only
└── data-pipeline/
    ├── 1_extract_wdpa.py      # Stage 1: WDPA extraction
    ├── 2_merge_unesco.ts      # Stage 2: Data merging
    ├── run-all.sh             # Pipeline orchestration
    └── README.md              # Detailed documentation
```

## 📦 Setup

### 1. Install Dependencies

#### Node.js

```bash
npm install
```

#### Python (with uv)

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
uv sync
```

### 2. Download Data

#### UNESCO Data (Required)

Download from: https://whc.unesco.org/en/syndication/

- English: `whc-sites-2025.xml` → Save as `data/raw/whc-en.xml`
- Chinese: `whc-sites-2025.xml?locale=zh` → Save as `data/raw/whc-zh.xml`

#### WDPA Data (Optional, for components)

Download from: https://www.protectedplanet.net/

- Select "World Database on Protected Areas (WDPA)"
- Filter: Designation Type = "World Heritage Site"
- Format: CSV
- Save as: `data/raw/WDPA_Oct2025_Public_csv.csv`

## 🚀 Usage

### Option 1: Quick (UNESCO Only)

```bash
npm run prepare:data
```

**Output**: `data/sites.json` with 1,247 sites (no components)

### Option 2: Full Pipeline (UNESCO + WDPA)

```bash
npm run prepare:data:full
```

**Output**: `data/sites.json` with enhanced data (currently no component-level data, see limitations)

### Option 3: Individual Stages

```bash
# Stage 1: Extract WDPA
npm run prepare:wdpa

# Stage 2: Merge all data
npm run prepare:merge
```

## 📝 Output Format

### sites.json Structure

```json
{
  "id": "438",
  "idNumber": "438",
  "uniqueNumber": "508",
  "latitude": 40.4167,
  "longitude": 116.0833,
  "region": "Asia and the Pacific",
  "isoCodes": ["cn"],
  "category": "Cultural",
  "criteriaText": "(i)(ii)(iii)(iv)(vi)",
  "dateInscribed": 1987,
  "danger": false,
  "transboundary": false,
  "httpUrl": "https://whc.unesco.org/en/list/438",
  "imageUrl": "https://whc.unesco.org/uploads/sites/site_438.jpg",
  "translations": {
    "en": {
      "name": "The Great Wall",
      "description": "In c. 220 B.C., under Qin Shi Huang...",
      "states": "China",
      "location": "Liaoning, Jilin, Hebei...",
      "justification": "..."
    },
    "zh": {
      "name": "长城",
      "description": "约公元前220年...",
      "states": "中国",
      "location": "辽宁、吉林、河北...",
      "justification": "..."
    }
  },
  "hasComponents": false,
  "componentCount": 0,
  "components": []
}
```

## ⚠️ Known Limitations

### 1. Component Data Currently Empty

**Issue**: WDPA CSV format doesn't include component-level boundaries.

**Example**: The Great Wall has 3+ component sections on UNESCO's website, but appears as a single entry in WDPA CSV.

**Solution**: Requires processing WDPA Shapefile (GIS data) - not yet implemented.

**Impact**: `hasComponents` is always `false` for now.

### 2. Name Matching Accuracy

**Issue**: 8 out of 266 WDPA sites remain unmatched to UNESCO IDs.

**Examples**:

- "Paraty and Ilha Grande - Culture and Biodiversity" (different name format)
- "K'gari (Fraser Island)" (name change)

**Solution**: Manual mapping or improved fuzzy matching algorithm.

### 3. Missing Chinese Translations

**Issue**: ~100+ sites lack Chinese translations in UNESCO data.

**Impact**: App falls back to English names for these sites.

## 🔄 Update Workflow

### Annual Update (Recommended)

Run when UNESCO adds new sites (usually July each year):

```bash
# 1. Download latest UNESCO XML
# 2. Replace files in data/raw/
# 3. Run pipeline
npm run prepare:data:full

# 4. Review changes
git diff data/sites.json

# 5. Commit if OK
git add data/sites.json
git commit -m "data: update to UNESCO 2025 dataset"
```

### Monthly Update (Optional)

If you want latest WDPA data:

```bash
# 1. Download latest WDPA CSV
# 2. Replace data/raw/WDPA_*.csv
# 3. Run pipeline
npm run prepare:data:full
```

## 🛠️ Troubleshooting

### Pipeline Fails at Stage 1

```
❌ UNESCO sites.json not found
```

**Fix**: Run `npm run prepare:data` first to generate initial `sites.json`.

### tsx not found

```
❌ tsx not found
```

**Fix**: Run `npm install` to install Node.js dependencies.

### uv not found

```
❌ Neither uv nor python3 found
```

**Fix**: Install uv:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Or use system Python:

```bash
python3 scripts/data-pipeline/1_extract_wdpa.py
```

## 📚 Further Reading

- [Pipeline Architecture Details](scripts/data-pipeline/README.md)
- [UNESCO Syndication Documentation](https://whc.unesco.org/en/syndication/)
- [WDPA User Manual](https://www.protectedplanet.net/en/resources)

## 🤝 Contributing

When adding new data sources or processing stages:

1. Add new script to `scripts/data-pipeline/`
2. Update `run-all.sh` to include new stage
3. Document in `scripts/data-pipeline/README.md`
4. Update this file with new workflow steps

---

**Last Updated**: 2025-10-14
