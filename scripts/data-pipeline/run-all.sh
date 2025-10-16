#!/bin/bash

# World Heritage Data Processing Pipeline
#
# This script runs the complete data processing pipeline:
# 1. Extract components from WDPA CSV (Python)
# 2. Merge with UNESCO XML data (TypeScript)
# 3. Enrich with Wikidata component coordinates (TypeScript)
# 4. Output final sites.json
#
# Usage:
#   bash scripts/data-pipeline/run-all.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 World Heritage Data Processing Pipeline${NC}"
echo "========================================================================"

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}📁 Project root: ${PROJECT_ROOT}${NC}"

# Check if raw data files exist
echo ""
echo "🔍 Checking raw data files..."

if [ ! -f "data/raw/whc-en.xml" ]; then
    echo -e "${RED}❌ Missing: data/raw/whc-en.xml${NC}"
    echo "   Download from: https://whc.unesco.org/en/syndication/"
    exit 1
fi

if [ ! -f "data/raw/whc-zh.xml" ]; then
    echo -e "${YELLOW}⚠️  Missing: data/raw/whc-zh.xml${NC}"
    echo "   Chinese data not found, will use English only"
fi

if [ ! -f "data/raw/WDPA_Oct2025_Public_csv.csv" ]; then
    echo -e "${YELLOW}⚠️  Missing: data/raw/WDPA_Oct2025_Public_csv.csv${NC}"
    echo "   WDPA data not found, will skip component extraction"
    SKIP_WDPA=true
else
    SKIP_WDPA=false
fi

echo -e "${GREEN}✓ Raw data check complete${NC}"

# Step 1: Extract WDPA components (Python)
if [ "$SKIP_WDPA" = false ]; then
    echo ""
    echo "========================================================================"
    echo -e "${BLUE}📊 Step 1/2: Extracting WDPA components...${NC}"
    echo "========================================================================"
    echo ""

    # Check if uv is installed
    if command -v uv &> /dev/null; then
        echo "Using uv to run Python script..."
        uv run python scripts/data-pipeline/1_extract_wdpa.py
    elif command -v python3 &> /dev/null; then
        echo "Using python3 to run script..."
        python3 scripts/data-pipeline/1_extract_wdpa.py
    else
        echo -e "${RED}❌ Neither uv nor python3 found${NC}"
        echo "   Please install Python 3.10+ or uv"
        exit 1
    fi

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ WDPA extraction failed${NC}"
        exit 1
    fi
else
    echo ""
    echo "⏭️  Skipping WDPA extraction (no CSV file found)"
fi

# Step 2: Merge UNESCO + WDPA data (TypeScript)
echo ""
echo "========================================================================"
echo -e "${BLUE}🔄 Step 2/3: Merging UNESCO and WDPA data...${NC}"
echo "========================================================================"
echo ""

# Check if tsx is available (try npx first, then global tsx)
if command -v tsx &> /dev/null; then
    tsx scripts/data-pipeline/2_merge_unesco.ts
elif [ -f "node_modules/.bin/tsx" ]; then
    npx tsx scripts/data-pipeline/2_merge_unesco.ts
else
    echo -e "${RED}❌ tsx not found${NC}"
    echo "   Please run: npm install"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Data merge failed${NC}"
    exit 1
fi

# Step 3: Enrich with Wikidata components (TypeScript)
echo ""
echo "========================================================================"
echo -e "${BLUE}🌐 Step 3/3: Enriching with Wikidata components...${NC}"
echo "========================================================================"
echo ""

# Check if Wikidata file exists
if [ ! -f "data/raw/multi-sites-data.json" ]; then
    echo -e "${YELLOW}⚠️  Missing: data/raw/multi-sites-data.json${NC}"
    echo "   Wikidata components not found, skipping enrichment"
    echo "   Site data will not include component-level coordinates"
else
    # Run Wikidata enrichment
    if command -v tsx &> /dev/null; then
        tsx scripts/data-pipeline/3_enrich_wikidata.ts
    elif [ -f "node_modules/.bin/tsx" ]; then
        npx tsx scripts/data-pipeline/3_enrich_wikidata.ts
    else
        echo -e "${RED}❌ tsx not found${NC}"
        echo "   Please run: npm install"
        exit 1
    fi

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Wikidata enrichment failed${NC}"
        exit 1
    fi
fi

# Success!
echo ""
echo "========================================================================"
echo -e "${GREEN}✨ Data pipeline completed successfully!${NC}"
echo "========================================================================"
echo ""
echo "📄 Output file: data/sites.json"
echo ""

# Show file size
if [ -f "data/sites.json" ]; then
    SIZE=$(du -h data/sites.json | cut -f1)
    echo "   File size: $SIZE"
fi

echo ""
echo "✅ Next steps:"
echo "   - Review data/sites.json"
echo "   - Run 'npm run dev' to test the application"
echo "   - Commit changes if everything looks good"
echo ""
