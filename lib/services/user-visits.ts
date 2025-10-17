import type { SupabaseClient } from '@supabase/supabase-js'
import type { PropertyVisitProgress, UserComponentVisit } from '@/lib/data/types'
import { getComponent, getComponentCount, getPropertyComponents } from '@/lib/services/components'
export { buildPropertyComponentId, isSyntheticPropertyComponent } from '@/lib/utils/component-ids'

import {
  extractSiteIdFromComponent,
  isSyntheticPropertyComponent as isSynthetic,
} from '@/lib/utils/component-ids'

type PublicSupabaseClient = SupabaseClient<unknown, unknown, unknown>

export async function getUserComponentVisits(
  supabase: PublicSupabaseClient,
  userId: string,
  siteId?: string
): Promise<UserComponentVisit[]> {
  let query = supabase.from('user_component_visits').select('*').eq('user_id', userId)

  if (siteId) {
    query = query.eq('site_id', siteId)
  }

  const { data, error } = await query.order('visit_date', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    componentId: row.component_id,
    siteId: row.site_id,
    visitDate: row.visit_date,
    notes: row.notes ?? undefined,
    photos: row.photos ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function markComponentVisited(
  supabase: PublicSupabaseClient,
  userId: string,
  componentId: string,
  siteId: string,
  visitDate?: string,
  notes?: string,
  photos?: string[]
) {
  const payload = {
    user_id: userId,
    component_id: componentId,
    site_id: siteId,
    visit_date: visitDate ?? new Date().toISOString().slice(0, 10),
    notes: notes ?? null,
    photos: photos ?? null,
  }

  const { error } = await supabase
    .from('user_component_visits')
    .upsert(payload, { onConflict: 'user_id,component_id' })

  if (error) {
    throw error
  }

  return payload
}

export async function unmarkComponentVisited(
  supabase: PublicSupabaseClient,
  userId: string,
  componentId: string
) {
  const { error } = await supabase
    .from('user_component_visits')
    .delete()
    .eq('user_id', userId)
    .eq('component_id', componentId)

  if (error) {
    throw error
  }
}

export async function getPropertyVisitProgress(
  supabase: PublicSupabaseClient,
  userId: string,
  siteId: string
): Promise<PropertyVisitProgress> {
  const { data, error } = await supabase
    .from('user_property_visit_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .maybeSingle()

  if (error) {
    throw error
  }

  const totalComponents = getComponentCount(siteId)
  const visitedComponentIds = data?.visited_component_ids ?? []

  const actualComponentIds = visitedComponentIds.filter((id: string) => !isSynthetic(id))
  const hasSyntheticVisit = visitedComponentIds.some((id: string) => isSynthetic(id))

  const visitedComponents = actualComponentIds.length
  const progress =
    totalComponents > 0 ? visitedComponents / totalComponents : hasSyntheticVisit ? 1 : 0
  const isVisited = hasSyntheticVisit || visitedComponents > 0

  return {
    siteId,
    totalComponents,
    visitedComponents,
    progress,
    isVisited,
    visitedComponentIds: actualComponentIds,
  }
}

export function resolveComponentSiteId(
  componentId: string,
  fallbackSiteId?: string
): string | undefined {
  const propertySiteId = extractSiteIdFromComponent(componentId)
  if (propertySiteId) {
    return propertySiteId
  }

  const component = getComponent(componentId)
  if (component) {
    return component.siteId
  }

  return fallbackSiteId
}

export function getComponentDisplayName(componentId: string): string {
  const propertySiteId = extractSiteIdFromComponent(componentId)
  if (propertySiteId) {
    return propertySiteId
  }

  const component = getComponent(componentId)
  if (!component) {
    return componentId
  }

  return component.name.en ?? Object.values(component.name)[0]
}

export function getComponentMetadata(componentId: string) {
  if (isSynthetic(componentId)) {
    return null
  }

  return getComponent(componentId)
}

export function getComponentWishlistDefaults(siteId: string) {
  const components = getPropertyComponents(siteId)
  return {
    totalComponents: components.length,
  }
}
