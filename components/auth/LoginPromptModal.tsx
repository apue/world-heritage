'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Locale } from '@/lib/i18n/config'

interface LoginPromptModalProps {
  open: boolean
  locale: Locale
  onConfirm: () => void
  onCancel: () => void
}

const copy: Record<Locale, { title: string; body: string; confirm: string; cancel: string }> = {
  en: {
    title: 'Sign in to continue',
    body: 'Sign in to mark sites and manage your World Heritage journey.',
    confirm: 'Continue with Google',
    cancel: 'Cancel',
  },
  zh: {
    title: '登录以继续',
    body: '登录后即可标记遗产地并管理你的世界遗产旅程。',
    confirm: '使用 Google 登录',
    cancel: '取消',
  },
}

export default function LoginPromptModal({ open, locale, onConfirm, onCancel }: LoginPromptModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted || typeof document === 'undefined') return null

  const t = copy[locale] ?? copy.en

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Modal */}
      <div className="relative z-[1001] w-[90%] max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-gray-900">{t.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{t.body}</p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
          >
            {/* Google icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{t.confirm}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}


