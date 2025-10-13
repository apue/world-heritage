/**
 * i18n Configuration
 * Central configuration for multi-language support
 */

export const languages = ['en', 'zh'] as const
export type Locale = (typeof languages)[number]

export const languageNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export const defaultLocale: Locale = 'en'

// Languages that use right-to-left text direction
export const rtlLanguages: Locale[] = []

// i18n configuration for Next.js
export const i18nConfig = {
  locales: languages,
  defaultLocale: defaultLocale,
  localeDetection: true,
}

// Check if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return languages.includes(locale as Locale)
}

// Get locale display name
export function getLocaleDisplayName(locale: Locale): string {
  return languageNames[locale] || locale
}

// Check if locale uses RTL
export function isRTL(locale: Locale): boolean {
  return rtlLanguages.includes(locale)
}
