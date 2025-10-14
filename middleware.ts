/**
 * Next.js Middleware for i18n and Supabase Auth
 * Handles:
 * 1. Supabase auth token refresh (must run first)
 * 2. Locale detection and routing
 */

import { NextRequest, NextResponse } from 'next/server'
import { i18nConfig, defaultLocale, isValidLocale } from '@/lib/i18n/config'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  console.log('[Middleware] Processing request:', pathname)

  // IMPORTANT: Handle Supabase auth first (before any returns)
  // This refreshes the user's session on every request
  const supabaseResponse = await updateSession(request)

  // Skip i18n logic for Next.js internal routes and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return supabaseResponse
  }

  // Skip i18n logic for auth routes (they handle their own redirects)
  if (pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = i18nConfig.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // Return the Supabase response (with updated cookies)
    return supabaseResponse
  }

  // Get user's preferred locale
  const locale = getLocale(request)

  // Redirect to localized URL, preserving Supabase cookies
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  newUrl.search = request.nextUrl.search // Preserve query params

  // Create redirect response and copy Supabase cookies
  const redirectResponse = NextResponse.redirect(newUrl)

  // Copy cookies from supabaseResponse to redirectResponse
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return redirectResponse
}

/**
 * Determine user's preferred locale based on:
 * 1. Cookie (NEXT_LOCALE)
 * 2. Accept-Language header
 * 3. Default locale
 */
function getLocale(request: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,zh;q=0.8")
    const languages = acceptLanguage.split(',').map((lang) => {
      const [code] = lang.trim().split(';')
      return code.split('-')[0] // Extract language code (en from en-US)
    })

    // Find first matching locale
    for (const lang of languages) {
      if (isValidLocale(lang)) {
        return lang
      }
    }
  }

  // 3. Return default locale
  return defaultLocale
}

export const config = {
  // Match all pathnames except:
  // - /_next (Next.js internals)
  // - /api (API routes)
  // - Static files (with extensions)
  matcher: ['/((?!_next|api).*)'],
}
