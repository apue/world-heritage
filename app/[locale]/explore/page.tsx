import { redirect } from 'next/navigation'
import type { LocalizedPageProps } from '@/lib/i18n/types'

/**
 * Redirect /explore to home page
 * The explore functionality is now the main home page
 */
export default async function ExploreRedirect({ params }: LocalizedPageProps) {
  const { locale } = await params
  redirect(`/${locale}`)
}
