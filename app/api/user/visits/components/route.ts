import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildPropertyComponentId,
  getPropertyVisitProgress,
  markComponentVisited,
  resolveComponentSiteId,
  unmarkComponentVisited,
} from '@/lib/services/user-visits'

interface ComponentVisitPayload {
  componentId?: string
  siteId?: string
  visitDate?: string
  notes?: string
  photos?: string[]
  scope?: 'property' | 'component'
}

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null }
  }

  return { supabase, user }
}

export async function POST(request: Request) {
  const { supabase, user } = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await request.json()) as ComponentVisitPayload
  const componentIdRaw = payload.componentId
  const scope = payload.scope ?? 'component'
  const siteIdFromBody = payload.siteId

  const componentId =
    scope === 'property' && siteIdFromBody
      ? buildPropertyComponentId(siteIdFromBody)
      : componentIdRaw

  if (!componentId) {
    return NextResponse.json({ error: 'componentId is required' }, { status: 400 })
  }

  const resolvedSiteId = resolveComponentSiteId(componentId, siteIdFromBody)

  if (!resolvedSiteId) {
    return NextResponse.json({ error: 'Unable to resolve siteId for component' }, { status: 400 })
  }

  try {
    await markComponentVisited(
      supabase,
      user.id,
      componentId,
      resolvedSiteId,
      payload.visitDate,
      payload.notes,
      payload.photos
    )

    const progress = await getPropertyVisitProgress(supabase, user.id, resolvedSiteId)

    return NextResponse.json({
      status: 'ok',
      componentId,
      siteId: resolvedSiteId,
      progress,
    })
  } catch (error) {
    console.error('[POST /api/user/visits/components] Failed:', error)
    return NextResponse.json({ error: 'Failed to mark component visited' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await request.json()) as ComponentVisitPayload

  const componentId = payload.componentId

  if (!componentId) {
    return NextResponse.json({ error: 'componentId is required' }, { status: 400 })
  }

  const resolvedSiteId = resolveComponentSiteId(componentId, payload.siteId)

  if (!resolvedSiteId) {
    return NextResponse.json({ error: 'Unable to resolve siteId for component' }, { status: 400 })
  }

  try {
    await unmarkComponentVisited(supabase, user.id, componentId)
    const progress = await getPropertyVisitProgress(supabase, user.id, resolvedSiteId)

    return NextResponse.json({
      status: 'ok',
      componentId,
      siteId: resolvedSiteId,
      progress,
    })
  } catch (error) {
    console.error('[DELETE /api/user/visits/components] Failed:', error)
    return NextResponse.json({ error: 'Failed to unmark component visit' }, { status: 500 })
  }
}
