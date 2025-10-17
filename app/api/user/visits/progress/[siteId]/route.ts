import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPropertyVisitProgress } from '@/lib/services/user-visits'

export async function GET(_request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const progress = await getPropertyVisitProgress(supabase, user.id, siteId)
    return NextResponse.json({ status: 'ok', progress })
  } catch (error) {
    console.error('[GET /api/user/visits/progress] Failed:', error)
    return NextResponse.json({ error: 'Failed to load visit progress' }, { status: 500 })
  }
}
