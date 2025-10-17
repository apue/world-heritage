import { getAllSites, getSiteById } from '@/lib/data/sites'
import type { ComponentSite } from '@/lib/data/types'

export interface ComponentWithSite extends ComponentSite {
  siteId: string
}

let componentIndex: Map<string, ComponentWithSite> | null = null

function ensureIndex() {
  if (componentIndex) {
    return componentIndex
  }

  const index = new Map<string, ComponentWithSite>()
  const sites = getAllSites()

  for (const site of sites) {
    if (!site.components || site.components.length === 0) {
      continue
    }

    for (const component of site.components) {
      index.set(component.componentId, { ...component, siteId: site.id })
    }
  }

  componentIndex = index
  return index
}

export function getPropertyComponents(siteId: string): ComponentSite[] {
  const site = getSiteById(siteId)
  if (!site || !site.components) {
    return []
  }
  return site.components
}

export function hasComponents(siteId: string): boolean {
  const site = getSiteById(siteId)
  return Boolean(site?.hasComponents && site.components && site.components.length > 0)
}

export function getComponentCount(siteId: string): number {
  const site = getSiteById(siteId)
  if (!site || !site.components) {
    return 0
  }
  return site.components.length
}

export function getComponent(componentId: string): ComponentWithSite | undefined {
  const index = ensureIndex()
  return index.get(componentId)
}

export function listAllComponents(): ComponentWithSite[] {
  const index = ensureIndex()
  return Array.from(index.values())
}
