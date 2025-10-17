import { NextResponse } from 'next/server'
import { getPropertyComponents, getComponentCount, hasComponents } from '@/lib/services/components'

export async function GET(_request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const components = getPropertyComponents(siteId)
  const response = {
    siteId,
    hasComponents: hasComponents(siteId),
    componentCount: getComponentCount(siteId),
    components,
  }

  return NextResponse.json(response)
}
