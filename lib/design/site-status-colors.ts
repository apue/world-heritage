/**
 * Unified color scheme for site status
 * Used across buttons, map markers, and UI elements
 */

import type { UserSiteStatus } from '@/lib/data/types'

export const SITE_STATUS_COLORS = {
  visited: {
    primary: '#10b981', // green-500
    light: '#d1fae5', // green-100
    dark: '#065f46', // green-800
    border: '#34d399', // green-400
    icon: '✓',
    label: 'Visited',
  },
  wishlist: {
    primary: '#f59e0b', // amber-500
    light: '#fef3c7', // amber-100
    dark: '#92400e', // amber-800
    border: '#fbbf24', // amber-400
    icon: '♡',
    label: 'Wishlist',
  },
  bookmark: {
    primary: '#ef4444', // red-500
    light: '#fee2e2', // red-100
    dark: '#991b1b', // red-800
    border: '#f87171', // red-400
    icon: '★',
    label: 'Bookmark',
  },
  default: {
    primary: '#3b82f6', // blue-500
    light: '#dbeafe', // blue-100
    dark: '#1e40af', // blue-800
    border: '#60a5fa', // blue-400
    icon: '○',
    label: 'Default',
  },
} as const

export type SiteStatusType = keyof typeof SITE_STATUS_COLORS

/**
 * Get the primary status type based on priority
 * Priority: visited > bookmark > wishlist > default
 *
 * This determines which color to show when a site has multiple statuses.
 * For example, if a site is both visited and bookmarked, it will show as visited (green).
 */
export function getPrimaryStatus(status: UserSiteStatus): SiteStatusType {
  if (status.visited) return 'visited'
  if (status.bookmark) return 'bookmark'
  if (status.wishlist) return 'wishlist'
  return 'default'
}

/**
 * Get Tailwind CSS classes for a status button
 */
export function getStatusButtonClasses(
  statusType: SiteStatusType,
  isActive: boolean,
  isCompact = false
): string {
  // Note: colors variable is available but not used in this function
  // It's kept for potential future use or can be removed if not needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colors = SITE_STATUS_COLORS[statusType]

  const baseClasses = [
    'rounded-lg',
    'border-2',
    'transition-all',
    'font-medium',
    'flex',
    'items-center',
    'justify-center',
    'gap-1',
    isCompact ? 'p-1.5 text-xs' : 'px-3 py-2 text-sm',
  ]

  if (isActive) {
    return [...baseClasses, 'shadow-md'].join(' ')
  }

  return [
    ...baseClasses,
    'bg-white',
    'border-gray-300',
    'text-gray-600',
    'hover:shadow-md',
    'hover:border-gray-400',
  ].join(' ')
}

/**
 * Get inline styles for active status button
 */
export function getActiveStatusStyles(statusType: SiteStatusType): React.CSSProperties {
  const colors = SITE_STATUS_COLORS[statusType]

  return {
    backgroundColor: colors.light,
    borderColor: colors.primary,
    color: colors.dark,
  }
}
