'use client'

/**
 * SiteActionButtons Component
 *
 * Displays visited/wishlist/bookmark buttons for a heritage site
 * Syncs with user authentication state and database
 * Supports both compact (popup) and full (detail page) variants
 */

import { useState } from 'react'
import { useUserSites } from '@/lib/contexts/UserSitesContext'
import {
  SITE_STATUS_COLORS,
  getStatusButtonClasses,
  getActiveStatusStyles,
} from '@/lib/design/site-status-colors'
import type { Locale } from '@/lib/i18n/config'

interface SiteActionButtonsProps {
  siteId: string
  variant?: 'popup' | 'detail'
  locale: Locale
}

const labels = {
  en: {
    visited: 'Visited',
    wishlist: 'Wishlist',
    bookmark: 'Bookmark',
    signInPrompt: 'Sign in to use this feature',
  },
  zh: {
    visited: '已访问',
    wishlist: '想去',
    bookmark: '收藏',
    signInPrompt: '请登录以使用此功能',
  },
} satisfies Record<Locale, Record<string, string>>

function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  return (
    <svg
      className={`animate-spin ${sizeClass}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export default function SiteActionButtons({
  siteId,
  variant = 'detail',
  locale,
}: SiteActionButtonsProps) {
  const { user, getSiteStatus, toggleVisited, toggleWishlist, toggleBookmark, isLoading } =
    useUserSites()
  const [processing, setProcessing] = useState<string | null>(null)

  const copy = labels[locale]
  const isCompact = variant === 'popup'

  // Don't show anything if still loading initial data
  if (isLoading) {
    return (
      <div className={`flex ${isCompact ? 'gap-1' : 'gap-2'} ${isCompact ? 'h-8' : 'h-10'}`}>
        <div className="h-full flex-1 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-full flex-1 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-full flex-1 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  // Don't show buttons if user is not logged in
  if (!user) {
    return null
  }

  const status = getSiteStatus(siteId)

  const handleToggle = async (
    type: 'visited' | 'wishlist' | 'bookmark',
    toggleFn: (id: string) => Promise<boolean>
  ) => {
    setProcessing(type)

    const success = await toggleFn(siteId)

    if (!success) {
      // Error already handled by context (alert shown + rollback)
    }

    setProcessing(null)
  }

  const buttons = [
    {
      type: 'visited' as const,
      statusType: 'visited' as const,
      active: status.visited,
      label: copy.visited,
      onClick: () => handleToggle('visited', toggleVisited),
    },
    {
      type: 'wishlist' as const,
      statusType: 'wishlist' as const,
      active: status.wishlist,
      label: copy.wishlist,
      onClick: () => handleToggle('wishlist', toggleWishlist),
    },
    {
      type: 'bookmark' as const,
      statusType: 'bookmark' as const,
      active: status.bookmark,
      label: copy.bookmark,
      onClick: () => handleToggle('bookmark', toggleBookmark),
    },
  ]

  return (
    <div className={`flex ${isCompact ? 'gap-1' : 'gap-2'}`}>
      {buttons.map((btn) => {
        const colors = SITE_STATUS_COLORS[btn.statusType]
        const isProcessing = processing === btn.type
        const buttonClasses = getStatusButtonClasses(btn.statusType, btn.active, isCompact)
        const activeStyles = btn.active ? getActiveStatusStyles(btn.statusType) : {}

        return (
          <button
            key={btn.type}
            onClick={btn.onClick}
            disabled={isProcessing}
            className={`${buttonClasses} ${isProcessing ? 'cursor-wait opacity-50' : ''}`}
            style={activeStyles}
            title={btn.label}
            aria-label={btn.label}
          >
            {isProcessing ? (
              <LoadingSpinner size={isCompact ? 'sm' : 'md'} />
            ) : (
              <>
                <span className={isCompact ? 'text-sm' : 'text-base'}>{colors.icon}</span>
                {!isCompact && <span>{btn.label}</span>}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
