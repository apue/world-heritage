export const PROPERTY_COMPONENT_PREFIX = 'property:'

export function buildPropertyComponentId(siteId: string): string {
  return `${PROPERTY_COMPONENT_PREFIX}${siteId}`
}

export function isSyntheticPropertyComponent(componentId: string): boolean {
  return componentId.startsWith(PROPERTY_COMPONENT_PREFIX)
}

export function extractSiteIdFromComponent(componentId: string): string | null {
  if (!isSyntheticPropertyComponent(componentId)) {
    return null
  }
  const siteId = componentId.slice(PROPERTY_COMPONENT_PREFIX.length)
  return siteId || null
}
