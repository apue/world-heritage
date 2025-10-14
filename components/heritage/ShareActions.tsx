'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ShareActionsProps {
  title: string
  shareLabel: string
  copyLabel: string
  copiedLabel: string
}

export default function ShareActions({
  title,
  shareLabel,
  copyLabel,
  copiedLabel,
}: ShareActionsProps) {
  const pathname = usePathname()
  const [shareUrl, setShareUrl] = useState('')
  const [hasCopied, setHasCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const origin = window.location.origin
    setShareUrl(`${origin}${pathname}`)
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [pathname])

  const handleShare = async () => {
    if (!shareUrl || !canShare) return
    try {
      await navigator.share({ title, url: shareUrl })
    } catch (error) {
      console.error('Share failed', error)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed', error)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {shareLabel}
        </button>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
      >
        {hasCopied ? copiedLabel : copyLabel}
      </button>
    </div>
  )
}
