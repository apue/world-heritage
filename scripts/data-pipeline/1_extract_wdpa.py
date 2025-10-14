#!/usr/bin/env python3
"""
Extract World Heritage Site components from WDPA dataset

Input:  data/raw/WDPA_Oct2025_Public_csv.csv (305K rows)
Output: data/processed/components.json (UNESCO sites only)

Usage:
    python scripts/data-pipeline/1_extract_wdpa.py
    # or with uv:
    uv run scripts/data-pipeline/1_extract_wdpa.py
"""

import csv
import json
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

# Ensure directories exist
PROCESSED_DIR.mkdir(exist_ok=True)


def extract_whs_components(csv_path: Path) -> Dict[str, List[Dict[str, Any]]]:
    """
    Extract World Heritage Site components from WDPA CSV

    Returns:
        Dict mapping site names to list of components
        {
            "Great Wall": [
                {
                    "wdpa_id": "12345",
                    "name": "Badaling Section",
                    ...
                },
                ...
            ]
        }
    """
    print(f"📖 Reading WDPA CSV: {csv_path}")
    print(f"   (This may take a minute, processing 300K+ rows...)")

    # Group components by site name
    whs_sites = defaultdict(list)
    whs_count = 0
    total_rows = 0

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                total_rows += 1

                # Show progress every 50k rows
                if total_rows % 50000 == 0:
                    print(f"   ... processed {total_rows:,} rows, found {whs_count} WHS components")

                desig_eng = row.get('DESIG_ENG', '')

                # Filter: Only World Heritage Sites
                if 'World Heritage' not in desig_eng:
                    continue

                whs_count += 1

                # Extract component info
                component = {
                    "wdpa_id": row.get('WDPAID', ''),
                    "wdpa_pid": row.get('WDPA_PID', ''),
                    "name": row.get('NAME', ''),
                    "name_orig": row.get('ORIG_NAME', ''),
                    "designation": desig_eng,
                    "iucn_category": row.get('IUCN_CAT', ''),
                    "status": row.get('STATUS', ''),
                    "status_year": row.get('STATUS_YR', ''),
                    "area_km2": float(row.get('REP_AREA', 0) or 0),
                    "iso_codes": [code.strip() for code in row.get('ISO3', '').split(';')] if row.get('ISO3') else [],
                    "marine": row.get('MARINE', '0') != '0',
                }

                # Group by site name
                site_name = component['name']
                whs_sites[site_name].append(component)

    except FileNotFoundError:
        print(f"❌ File not found: {csv_path}")
        raise
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        raise

    print(f"   ✓ Processed {total_rows:,} total rows")
    print(f"   ✓ Found {whs_count} World Heritage Site components")
    print(f"   ✓ Grouped into {len(whs_sites)} unique sites")

    return dict(whs_sites)


def load_unesco_sites(sites_json_path: Path) -> List[Dict[str, Any]]:
    """Load existing UNESCO sites.json"""
    if not sites_json_path.exists():
        print(f"❌ UNESCO sites.json not found: {sites_json_path}")
        print(f"   Please run 'npm run prepare:data' first to generate sites.json")
        raise FileNotFoundError(f"sites.json not found at {sites_json_path}")

    with open(sites_json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def create_unesco_mapping(
    whs_data: Dict[str, List[Dict[str, Any]]],
    unesco_sites: List[Dict[str, Any]]
) -> Dict[str, str]:
    """
    Create mapping between WDPA site names and UNESCO IDs

    This uses fuzzy matching - may need manual adjustment for some sites
    """
    print("\n🔗 Creating UNESCO ID mapping...")

    mapping = {}
    unmatched = []

    for wdpa_name, components in whs_data.items():
        matched = False

        for site in unesco_sites:
            # Get UNESCO name (English)
            unesco_name = site['translations']['en']['name']

            # Strategy 1: Exact match (case-insensitive)
            if wdpa_name.lower() == unesco_name.lower():
                mapping[wdpa_name] = site['idNumber']
                matched = True
                break

            # Strategy 2: Substring match
            wdpa_lower = wdpa_name.lower()
            unesco_lower = unesco_name.lower()

            if wdpa_lower in unesco_lower or unesco_lower in wdpa_lower:
                mapping[wdpa_name] = site['idNumber']
                matched = True
                break

            # Strategy 3: Match by ISO codes + first word
            if components and components[0]['iso_codes']:
                wdpa_iso = set(code.lower() for code in components[0]['iso_codes'])
                unesco_iso = set(code.lower() for code in site['isoCodes'])

                # If ISO codes overlap and first word matches
                if wdpa_iso & unesco_iso:
                    wdpa_first = wdpa_name.split()[0].lower()
                    unesco_first = unesco_name.split()[0].lower()

                    if wdpa_first == unesco_first or \
                       wdpa_first in unesco_lower or \
                       unesco_first in wdpa_lower:
                        mapping[wdpa_name] = site['idNumber']
                        matched = True
                        break

        if not matched:
            unmatched.append(wdpa_name)

    print(f"   ✓ Matched {len(mapping)} sites to UNESCO IDs")
    print(f"   ⚠️  Unmatched: {len(unmatched)} sites")

    if unmatched:
        print(f"\n   📋 Unmatched sites (first 20):")
        for i, name in enumerate(unmatched[:20], 1):
            print(f"      {i:2d}. {name}")

        if len(unmatched) > 20:
            print(f"      ... and {len(unmatched) - 20} more")

    return mapping


def main():
    print("🌍 WDPA Component Extraction Pipeline")
    print("=" * 70 + "\n")

    # Input files
    wdpa_csv = RAW_DIR / "WDPA_Oct2025_Public_csv.csv"
    unesco_json = DATA_DIR / "sites.json"

    # Output files
    components_json = PROCESSED_DIR / "components.json"
    mapping_json = PROCESSED_DIR / "wdpa-mapping.json"

    # Check if input files exist
    if not wdpa_csv.exists():
        print(f"❌ WDPA CSV not found: {wdpa_csv}")
        print(f"   Please download from: https://www.protectedplanet.net/")
        print(f"   And place it at: {wdpa_csv}")
        return 1

    try:
        # Step 1: Extract components from WDPA
        whs_components = extract_whs_components(wdpa_csv)

        # Step 2: Load UNESCO sites
        print(f"\n📚 Loading UNESCO sites from: {unesco_json}")
        unesco_sites = load_unesco_sites(unesco_json)
        print(f"   ✓ Loaded {len(unesco_sites)} UNESCO sites")

        # Step 3: Create mapping
        unesco_mapping = create_unesco_mapping(whs_components, unesco_sites)

        # Step 4: Reorganize by UNESCO ID
        print(f"\n🔄 Reorganizing components by UNESCO ID...")
        components_by_id = {}

        for wdpa_name, components in whs_components.items():
            unesco_id = unesco_mapping.get(wdpa_name)
            if unesco_id:
                # Only keep sites with multiple components (serial/transboundary)
                # Single-component sites don't need this data
                if len(components) > 1:
                    components_by_id[unesco_id] = components

        print(f"   ✓ Found {len(components_by_id)} sites with multiple components")

        # Step 5: Save outputs
        print(f"\n💾 Saving outputs...")

        with open(components_json, 'w', encoding='utf-8') as f:
            json.dump(components_by_id, f, indent=2, ensure_ascii=False)

        file_size = components_json.stat().st_size / 1024
        print(f"   ✓ Components: {components_json} ({file_size:.1f} KB)")

        with open(mapping_json, 'w', encoding='utf-8') as f:
            json.dump(unesco_mapping, f, indent=2, ensure_ascii=False)

        file_size = mapping_json.stat().st_size / 1024
        print(f"   ✓ Mapping: {mapping_json} ({file_size:.1f} KB)")

        # Summary
        print("\n" + "=" * 70)
        print("✅ WDPA extraction completed successfully!")
        print(f"\n📊 Summary:")
        print(f"   - Total WHS components in WDPA: {sum(len(v) for v in whs_components.values())}")
        print(f"   - Unique sites in WDPA: {len(whs_components)}")
        print(f"   - Matched to UNESCO IDs: {len(unesco_mapping)}")
        print(f"   - Sites with multiple components: {len(components_by_id)}")

        return 0

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
