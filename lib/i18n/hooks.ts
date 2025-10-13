/**
 * i18n Hooks
 * React hooks for accessing locale information in client components
 */

'use client'

import { useParams } from 'next/navigation'
import { isValidLocale, type Locale } from './config'

/**
 * Hook to safely get the current locale
 * Throws an error if locale is missing or invalid (helps catch bugs early)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const locale = useLocale()
 *   return <div>{locale}</div>
 * }
 * ```
 */
export function useLocale(): Locale {
  const params = useParams()
  const locale = params.locale as string | undefined

  if (!locale) {
    throw new Error(
      '❌ useLocale() must be used inside [locale] route. ' +
        'Make sure your page is in app/[locale]/ directory.'
    )
  }

  if (!isValidLocale(locale)) {
    throw new Error(`❌ Invalid locale: "${locale}". ` + `Supported locales: en, zh`)
  }

  return locale
}
