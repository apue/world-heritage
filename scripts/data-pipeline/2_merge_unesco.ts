/**
 * Merge UNESCO XML data with WDPA components
 *
 * Input:
 *   - data/raw/whc-en.xml, whc-zh.xml (UNESCO data)
 *   - data/processed/components.json (WDPA components)
 *
 * Output:
 *   - data/sites.json (final merged data)
 *
 * Usage:
 *   tsx scripts/data-pipeline/2_merge_unesco.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { parseStringPromise } from 'xml2js'

// Supported languages
type Language = 'en' | 'zh'
const LANGUAGES: Language[] = ['en', 'zh']

// Raw XML structure (as parsed from UNESCO data)
interface RawXMLRow {
  category: string[]
  criteria_txt: string[]
  danger: string[]
  date_inscribed: string[]
  extension: string[]
  http_url: string[]
  id_number: string[]
  image_url: string[]
  iso_code: string[]
  justification: string[]
  latitude: string[]
  location: string[]
  longitude: string[]
  region: string[]
  revision: string[]
  secondary_dates: string[]
  short_description: string[]
  site: string[]
  states: string[]
  transboundary: string[]
  unique_number: string[]
}

// Translation data for a specific language
interface Translation {
  name: string
  description: string
  states: string
  location: string
  justification: string
}

// WDPA Component from Python script
interface WDPAComponent {
  wdpa_id: string
  wdpa_pid: string
  name: string
  name_orig: string
  designation: string
  iucn_category: string
  status: string
  status_year: string
  area_km2: number
  iso_codes: string[]
  marine: boolean
}

// Component site in our data model
interface ComponentSite {
  componentId: string
  parentId: string
  name: Record<Language, string>
  area?: number
  designation?: string
  // Note: latitude/longitude would come from shapefile (not implemented yet)
}

// Final processed site structure
interface ProcessedSite {
  id: string
  idNumber: string
  uniqueNumber: string

  // Geographic data
  latitude: number
  longitude: number
  region: string
  isoCodes: string[]

  // Classification
  category: 'Cultural' | 'Natural' | 'Mixed'
  criteriaText: string

  // Dates and status
  dateInscribed: number
  secondaryDates: string
  danger: boolean
  dangerPeriod: string

  // Metadata
  transboundary: boolean
  extension: number
  revision: number

  // URLs
  httpUrl: string
  imageUrl: string

  // Multi-language content
  translations: Record<Language, Translation>

  // Components (optional)
  hasComponents?: boolean
  componentCount?: number
  components?: ComponentSite[]
}

/**
 * Clean HTML tags from description text
 */
function cleanHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&middot;/g, '·') // Replace &middot;
    .replace(/&rsquo;/g, "'") // Replace &rsquo;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&#x[0-9a-fA-F]+;/g, '') // Remove hex entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Parse danger field to extract boolean and period
 */
function parseDanger(danger: string): { isDanger: boolean; period: string } {
  if (!danger || danger.trim() === '') {
    return { isDanger: false, period: '' }
  }
  return { isDanger: true, period: danger.trim() }
}

/**
 * Parse ISO codes into array
 */
function parseIsoCodes(isoCode: string): string[] {
  if (!isoCode) return []
  return isoCode.split(',').map((code) => code.trim().toLowerCase())
}

/**
 * Read and parse an XML file
 */
async function readXML(lang: Language): Promise<RawXMLRow[]> {
  const filePath = path.join(process.cwd(), 'data', 'raw', `whc-${lang}.xml`)

  console.log(`📖 Reading ${lang} XML: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const xmlContent = fs.readFileSync(filePath, 'utf-8')
  const parsed = await parseStringPromise(xmlContent)

  const rows = parsed.query.row as RawXMLRow[]
  console.log(`   ✓ Parsed ${rows.length} sites`)

  return rows
}

/**
 * Load WDPA components from processed JSON
 */
function loadWDPAComponents(): Record<string, WDPAComponent[]> {
  const componentsPath = path.join(process.cwd(), 'data', 'processed', 'components.json')

  if (!fs.existsSync(componentsPath)) {
    console.log('⚠️  No WDPA components found, skipping component integration...')
    return {}
  }

  console.log(`\n📦 Loading WDPA components: ${componentsPath}`)
  const data = fs.readFileSync(componentsPath, 'utf-8')
  const components = JSON.parse(data) as Record<string, WDPAComponent[]>

  console.log(`   ✓ Loaded components for ${Object.keys(components).length} sites`)

  return components
}

/**
 * Convert WDPA components to ComponentSite format
 */
function convertToComponentSites(
  parentId: string,
  wdpaComponents: WDPAComponent[]
): ComponentSite[] {
  return wdpaComponents.map((comp) => ({
    componentId: comp.wdpa_pid,
    parentId,
    name: {
      en: comp.name,
      zh: comp.name_orig || comp.name,
    },
    area: comp.area_km2 > 0 ? comp.area_km2 : undefined,
    designation: comp.designation,
    // Note: latitude/longitude not available from CSV
    // Would need shapefile processing to add coordinates
  }))
}

/**
 * Process all languages and merge data
 */
async function processAllLanguages(): Promise<ProcessedSite[]> {
  const sitesMap = new Map<string, ProcessedSite>()

  for (const lang of LANGUAGES) {
    console.log(`\n🌐 Processing ${lang.toUpperCase()} data...`)
    const rows = await readXML(lang)

    for (const row of rows) {
      const id = row.id_number[0]

      // Initialize site if first time seeing it
      if (!sitesMap.has(id)) {
        const lat = parseFloat(row.latitude[0])
        const lng = parseFloat(row.longitude[0])

        // Skip sites with invalid coordinates
        if (isNaN(lat) || isNaN(lng)) {
          console.log(`   ⚠ Skipping site ${id}: invalid coordinates`)
          continue
        }

        const dangerInfo = parseDanger(row.danger[0])

        sitesMap.set(id, {
          id,
          idNumber: row.id_number[0],
          uniqueNumber: row.unique_number[0],

          latitude: lat,
          longitude: lng,
          region: row.region[0],
          isoCodes: parseIsoCodes(row.iso_code[0]),

          category: row.category[0] as 'Cultural' | 'Natural' | 'Mixed',
          criteriaText: row.criteria_txt[0],

          dateInscribed: parseInt(row.date_inscribed[0]),
          secondaryDates: row.secondary_dates[0] || '',
          danger: dangerInfo.isDanger,
          dangerPeriod: dangerInfo.period,

          transboundary: row.transboundary[0] === '1',
          extension: parseInt(row.extension[0] || '0'),
          revision: parseInt(row.revision[0] || '0'),

          httpUrl: row.http_url[0],
          imageUrl: row.image_url[0],

          translations: {} as Record<Language, Translation>,
        })
      }

      // Add translation for current language
      const site = sitesMap.get(id)!
      site.translations[lang] = {
        name: row.site[0] || '',
        description: cleanHtml(row.short_description[0] || ''),
        states: row.states[0] || '',
        location: row.location[0] || '',
        justification: cleanHtml(row.justification[0] || ''),
      }
    }

    console.log(`   ✓ Processed ${rows.length} sites in ${lang}`)
  }

  return Array.from(sitesMap.values())
}

/**
 * Merge WDPA components into sites
 */
function mergeComponents(
  sites: ProcessedSite[],
  wdpaComponents: Record<string, WDPAComponent[]>
): void {
  console.log('\n🔄 Merging WDPA components...')

  let sitesWithComponents = 0
  let totalComponentsAdded = 0

  for (const site of sites) {
    const components = wdpaComponents[site.idNumber]

    if (components && components.length > 0) {
      site.hasComponents = true
      site.componentCount = components.length
      site.components = convertToComponentSites(site.id, components)

      sitesWithComponents++
      totalComponentsAdded += components.length
    }
  }

  console.log(`   ✓ Added components to ${sitesWithComponents} sites`)
  console.log(`   ✓ Total components: ${totalComponentsAdded}`)
}

/**
 * Validate processed data
 */
function validateData(sites: ProcessedSite[]): void {
  console.log('\n🔍 Validating data...')

  let errors = 0

  sites.forEach((site, index) => {
    // Check required fields
    if (!site.id || !site.idNumber) {
      console.error(`   ❌ Site ${index}: Missing ID`)
      errors++
    }

    // Check coordinates
    if (site.latitude < -90 || site.latitude > 90) {
      console.error(`   ❌ Site ${site.id}: Invalid latitude ${site.latitude}`)
      errors++
    }

    if (site.longitude < -180 || site.longitude > 180) {
      console.error(`   ❌ Site ${site.id}: Invalid longitude ${site.longitude}`)
      errors++
    }

    // Check translations - at least one language must have a name
    const hasAnyTranslation = LANGUAGES.some(
      (lang) => site.translations[lang] && site.translations[lang].name
    )

    if (!hasAnyTranslation) {
      console.error(`   ❌ Site ${site.id}: No valid translations found`)
      errors++
    }

    // Warn about missing translations (non-fatal)
    LANGUAGES.forEach((lang) => {
      if (!site.translations[lang] || !site.translations[lang].name) {
        console.warn(`   ⚠️  Site ${site.id}: Missing ${lang} translation`)
      }
    })
  })

  if (errors > 0) {
    console.error(`\n   ❌ Found ${errors} errors`)
    throw new Error('Data validation failed')
  }

  console.log(`   ✓ All ${sites.length} sites validated successfully`)
}

/**
 * Generate statistics
 */
function generateStats(sites: ProcessedSite[]): void {
  console.log('\n📊 Statistics:')

  const categoryCount = {
    Cultural: 0,
    Natural: 0,
    Mixed: 0,
  }

  const regionCount: Record<string, number> = {}
  let transboundaryCount = 0
  let dangerCount = 0
  let sitesWithComponents = 0
  let totalComponents = 0

  sites.forEach((site) => {
    categoryCount[site.category]++
    regionCount[site.region] = (regionCount[site.region] || 0) + 1
    if (site.transboundary) transboundaryCount++
    if (site.danger) dangerCount++
    if (site.hasComponents) {
      sitesWithComponents++
      totalComponents += site.componentCount || 0
    }
  })

  console.log(`   Total Sites: ${sites.length}`)
  console.log(`   Categories:`)
  console.log(`     - Cultural: ${categoryCount.Cultural}`)
  console.log(`     - Natural: ${categoryCount.Natural}`)
  console.log(`     - Mixed: ${categoryCount.Mixed}`)
  console.log(`   Transboundary: ${transboundaryCount}`)
  console.log(`   In Danger: ${dangerCount}`)
  console.log(`   With Components: ${sitesWithComponents}`)
  console.log(`   Total Components: ${totalComponents}`)
  console.log(`   Regions:`)
  Object.entries(regionCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      console.log(`     - ${region}: ${count}`)
    })
}

/**
 * Main execution
 */
async function main() {
  console.log('🌍 UNESCO + WDPA Data Merge Pipeline\n')
  console.log('='.repeat(70))

  try {
    // Step 1: Process UNESCO XML data
    const sites = await processAllLanguages()

    // Step 2: Load WDPA components
    const wdpaComponents = loadWDPAComponents()

    // Step 3: Merge components (if available)
    if (Object.keys(wdpaComponents).length > 0) {
      mergeComponents(sites, wdpaComponents)
    }

    // Step 4: Validate data
    validateData(sites)

    // Step 5: Sort by ID for consistency
    sites.sort((a, b) => parseInt(a.idNumber) - parseInt(b.idNumber))

    // Step 6: Generate statistics
    generateStats(sites)

    // Step 7: Write output
    const outputPath = path.join(process.cwd(), 'data', 'sites.json')
    console.log(`\n💾 Writing output to: ${outputPath}`)

    fs.writeFileSync(outputPath, JSON.stringify(sites, null, 2), 'utf-8')

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2)
    console.log(`   ✓ File written: ${fileSize} KB`)

    console.log('\n' + '='.repeat(70))
    console.log('✅ Data merge completed successfully!')
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
main()
