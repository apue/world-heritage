/**
 * Stage 3: Enrich sites.json with Wikidata components
 *
 * Input:
 *   - data/sites.json (Stage 2 output)
 *   - data/raw/multi-sites-data.json (Wikidata)
 *
 * Output:
 *   - data/sites.json (updated with components)
 *
 * Usage:
 *   tsx scripts/data-pipeline/3_enrich_wikidata.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Supported languages
type Language = 'en' | 'zh'
const LANGUAGES: Language[] = ['en', 'zh']

// Wikidata component from multi-sites-data.json
interface WikidataComponent {
  whs_id: string
  component: string // Wikidata URI
  componentLabel: string
  lat: string
  lon: string
  source: 'component' | 'site_self'
}

// Component site structure (matching lib/data/types.ts after Stage 3)
interface ComponentSite {
  componentId: string
  wikidataUri: string
  parentId: string
  latitude: number
  longitude: number
  country?: string
  name: Record<Language, string>
  description?: Record<Language, string>
  area?: number
  designation?: string
}

// Translation structure
interface Translation {
  name: string
  description: string
  states: string
  location: string
  justification: string
}

// Processed site structure (from Stage 2)
interface ProcessedSite {
  id: string
  idNumber: string
  uniqueNumber: string
  latitude: number
  longitude: number
  region: string
  isoCodes: string[]
  category: 'Cultural' | 'Natural' | 'Mixed'
  criteriaText: string
  dateInscribed: number
  secondaryDates: string
  danger: boolean
  dangerPeriod: string
  transboundary: boolean
  extension: number
  revision: number
  httpUrl: string
  imageUrl: string
  translations: Record<Language, Translation>
  hasComponents?: boolean
  componentCount?: number
  components?: ComponentSite[]
}

/**
 * Extract base ID from various whs_id formats
 *
 * Examples:
 *   "1133" -> "1133"
 *   "1133bis" -> "1133"
 *   "1133ter" -> "1133"
 *   "1133-001" -> "1133"
 *   "1133ter-034" -> "1133"
 */
function extractBaseId(whsId: string): string {
  const match = whsId.match(/^(\d+)/)
  return match ? match[1] : whsId
}

/**
 * Extract Wikidata QID from URI
 *
 * Example: "http://www.wikidata.org/entity/Q29583927" -> "Q29583927"
 */
function extractWikidataId(uri: string): string {
  return uri.split('/').pop() || uri
}

/**
 * Main execution
 */
async function main() {
  console.log('🌐 Wikidata Components Enrichment Pipeline\n')
  console.log('='.repeat(70))

  try {
    // Step 1: Load existing sites.json from Stage 2
    const sitesPath = path.join(process.cwd(), 'data', 'sites.json')

    if (!fs.existsSync(sitesPath)) {
      throw new Error('sites.json not found. Please run Stage 2 first.')
    }

    console.log(`\n📖 Loading sites.json...`)
    const sites: ProcessedSite[] = JSON.parse(fs.readFileSync(sitesPath, 'utf-8'))
    console.log(`   ✓ Loaded ${sites.length} sites`)

    // Step 2: Load Wikidata components
    const wikidataPath = path.join(process.cwd(), 'data', 'raw', 'multi-sites-data.json')

    if (!fs.existsSync(wikidataPath)) {
      throw new Error('multi-sites-data.json not found. Please download Wikidata data to data/raw/')
    }

    console.log(`\n📦 Loading Wikidata components...`)
    const rawData: WikidataComponent[] = JSON.parse(fs.readFileSync(wikidataPath, 'utf-8'))
    console.log(`   ✓ Loaded ${rawData.length} Wikidata records`)

    // Step 3: Deduplicate by Wikidata URI (component field)
    // Some components appear multiple times with different whs_id variants
    console.log(`\n🔄 Deduplicating components...`)
    const uniqueComponents = new Map<string, WikidataComponent>()

    for (const record of rawData) {
      const uri = record.component

      // Keep the first occurrence, or replace if new one has better data
      if (!uniqueComponents.has(uri)) {
        uniqueComponents.set(uri, record)
      } else {
        // Prefer records with coordinates
        const existing = uniqueComponents.get(uri)!
        if (record.lat && record.lon && (!existing.lat || !existing.lon)) {
          uniqueComponents.set(uri, record)
        }
      }
    }

    console.log(`   ✓ Deduplicated to ${uniqueComponents.size} unique components`)

    // Step 4: Group components by base whs_id
    console.log(`\n📊 Grouping components by property...`)
    const componentsByBaseId = new Map<string, WikidataComponent[]>()

    for (const comp of uniqueComponents.values()) {
      const baseId = extractBaseId(comp.whs_id)

      if (!componentsByBaseId.has(baseId)) {
        componentsByBaseId.set(baseId, [])
      }
      componentsByBaseId.get(baseId)!.push(comp)
    }

    console.log(`   ✓ Grouped into ${componentsByBaseId.size} properties`)

    // Step 5: Merge components into sites
    console.log(`\n🔗 Merging components into sites...`)
    let sitesEnriched = 0
    let totalComponentsAdded = 0
    let sitesSkipped = 0

    for (const site of sites) {
      const components = componentsByBaseId.get(site.idNumber)

      if (!components || components.length === 0) {
        continue
      }

      // Filter out components without valid coordinates
      // Also filter out pseudo-components (same coordinates as property itself)
      const validComponents = components.filter((c) => {
        const lat = parseFloat(c.lat)
        const lon = parseFloat(c.lon)

        // Check valid coordinates
        if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
          return false
        }

        // Filter out pseudo-components: coordinates identical to property
        // Using tolerance of 0.0001 degrees (~11 meters) to account for floating point precision
        const latDiff = Math.abs(lat - site.latitude)
        const lonDiff = Math.abs(lon - site.longitude)
        const TOLERANCE = 0.0001

        if (latDiff < TOLERANCE && lonDiff < TOLERANCE) {
          console.log(
            `   🔍 Filtering pseudo-component for site ${site.idNumber}: ${c.componentLabel} (same coordinates as property)`
          )
          return false
        }

        return true
      })

      if (validComponents.length === 0) {
        console.warn(
          `   ⚠️  Site ${site.idNumber}: All components missing valid coordinates, skipping`
        )
        sitesSkipped++
        continue
      }

      // Convert to ComponentSite format
      site.components = validComponents.map((comp) => ({
        componentId: extractWikidataId(comp.component),
        wikidataUri: comp.component,
        parentId: site.id,

        latitude: parseFloat(comp.lat),
        longitude: parseFloat(comp.lon),

        // Multi-language names (TODO: add Chinese translation)
        name: {
          en: comp.componentLabel,
          zh: comp.componentLabel, // Fallback to English for now
        },
      }))

      site.hasComponents = true
      site.componentCount = site.components.length

      sitesEnriched++
      totalComponentsAdded += site.components.length
    }

    console.log(`   ✓ Enriched ${sitesEnriched} sites`)
    console.log(`   ✓ Added ${totalComponentsAdded} components`)
    if (sitesSkipped > 0) {
      console.log(`   ⚠️  Skipped ${sitesSkipped} sites (no valid coordinates)`)
    }

    // Step 6: Generate statistics
    console.log(`\n📊 Statistics:`)
    console.log(`   Properties with components: ${sitesEnriched}`)
    console.log(`   Total components added: ${totalComponentsAdded}`)
    console.log(
      `   Average components per property: ${(totalComponentsAdded / sitesEnriched).toFixed(1)}`
    )

    // Distribution analysis
    const componentCounts = sites
      .filter((s) => s.hasComponents)
      .map((s) => s.componentCount || 0)
      .sort((a, b) => a - b)

    if (componentCounts.length > 0) {
      const min = componentCounts[0]
      const max = componentCounts[componentCounts.length - 1]
      const median = componentCounts[Math.floor(componentCounts.length / 2)]

      console.log(`   Min components: ${min}`)
      console.log(`   Max components: ${max}`)
      console.log(`   Median components: ${median}`)
    }

    // Step 7: Validate data
    console.log(`\n🔍 Validating data...`)
    let errors = 0

    for (const site of sites) {
      if (site.hasComponents && (!site.components || site.components.length === 0)) {
        console.error(`   ❌ Site ${site.id}: hasComponents=true but no components array`)
        errors++
      }

      if (site.hasComponents && site.componentCount !== site.components?.length) {
        console.error(
          `   ❌ Site ${site.id}: componentCount mismatch (${site.componentCount} vs ${site.components?.length})`
        )
        errors++
      }

      site.components?.forEach((comp, idx) => {
        if (!comp.latitude || !comp.longitude) {
          console.error(
            `   ❌ Site ${site.id} component ${idx}: Missing coordinates after validation`
          )
          errors++
        }

        if (
          comp.latitude < -90 ||
          comp.latitude > 90 ||
          comp.longitude < -180 ||
          comp.longitude > 180
        ) {
          console.error(
            `   ❌ Site ${site.id} component ${idx}: Invalid coordinates (${comp.latitude}, ${comp.longitude})`
          )
          errors++
        }

        if (!comp.wikidataUri || !comp.wikidataUri.startsWith('http://www.wikidata.org/entity/')) {
          console.error(
            `   ❌ Site ${site.id} component ${idx}: Invalid wikidataUri: ${comp.wikidataUri}`
          )
          errors++
        }

        if (!comp.name.en) {
          console.error(`   ❌ Site ${site.id} component ${idx}: Missing English name`)
          errors++
        }
      })
    }

    if (errors > 0) {
      console.error(`\n   ❌ Found ${errors} validation errors`)
      throw new Error('Data validation failed')
    }

    console.log(`   ✓ All ${sites.length} sites validated successfully`)

    // Step 8: Write output
    console.log(`\n💾 Writing output to: ${sitesPath}`)
    fs.writeFileSync(sitesPath, JSON.stringify(sites, null, 2), 'utf-8')

    const publicSitesPath = path.join(process.cwd(), 'public', 'sites.json')
    console.log(`   ↳ Syncing public bundle: ${publicSitesPath}`)
    fs.writeFileSync(publicSitesPath, JSON.stringify(sites, null, 2), 'utf-8')

    const stageFileSize = (fs.statSync(sitesPath).size / 1024 / 1024).toFixed(2)
    const publicFileSize = (fs.statSync(publicSitesPath).size / 1024 / 1024).toFixed(2)
    console.log(`   ✓ Stage file size: ${stageFileSize} MB`)
    console.log(`   ✓ Public file size: ${publicFileSize} MB`)

    console.log('\n' + '='.repeat(70))
    console.log('✅ Wikidata enrichment completed successfully!')
    console.log(`\n📈 Summary:`)
    console.log(`   - Total sites: ${sites.length}`)
    console.log(
      `   - Sites with components: ${sitesEnriched} (${((sitesEnriched / sites.length) * 100).toFixed(1)}%)`
    )
    console.log(`   - Total components: ${totalComponentsAdded}`)
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
main()
