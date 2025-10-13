/**
 * i18n Type Definitions
 * Type-safe interfaces for multi-language pages and components
 */

import type { Locale } from './config'

/**
 * Props interface for pages that require locale parameter
 * All pages under app/[locale]/ should implement this interface
 *
 * Note: Next.js infers params.locale as string, not the specific Locale union type.
 * Use type assertion when consuming the locale value.
 */
export interface LocalizedPageProps<T extends Record<string, unknown> = Record<string, never>> {
  params: Promise<
    {
      locale: string
    } & T
  >
}

/**
 * Props interface for components that accept locale
 */
export interface WithLocale {
  locale: Locale
}
