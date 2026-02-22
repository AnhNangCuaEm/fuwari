'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import type { NotificationWithStatus } from '@/lib/notifications'

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    general: { label: 'General', color: 'text-cosmos-600', bg: 'bg-cosmos-50' },
    welcome: { label: 'Welcome', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    order: { label: 'Order', color: 'text-blue-600', bg: 'bg-blue-50' },
    system: { label: 'System', color: 'text-gray-600', bg: 'bg-gray-50' },
    promo: { label: 'Promo', color: 'text-pink-600', bg: 'bg-pink-50' },
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    })
}

interface Props {
    notification: NotificationWithStatus | null
    onClose: () => void
}

export default function NotificationModal({ notification, onClose }: Props) {
    const isOpen = !!notification

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (typeof window === 'undefined') return null

    const cfg = typeConfig[notification?.type ?? 'general'] ?? typeConfig.general

    return createPortal(
        <AnimatePresence>
            {isOpen && notification && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="noti-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="noti-modal"
                        initial={{ opacity: 0, scale: 0.93, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: 24 }}
                        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white/95 backdrop-blur-xl border border-cosmos-100/80 rounded-2xl shadow-[0_20px_60px_-15px_rgba(201,57,71,0.15),0_8px_24px_-8px_rgba(0,0,0,0.12)] w-full max-w-md pointer-events-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-cosmos-100/60">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-full hover:bg-cosmos-50 text-almond-6 hover:text-cosmos-500 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5">
                                <h2 className="text-lg font-bold text-almond-10 mb-3 leading-snug">
                                    {notification.title}
                                </h2>
                                <p className="text-sm text-almond-7 leading-relaxed whitespace-pre-wrap">
                                    {notification.body}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-5 flex items-center justify-between">
                                <span className="text-xs text-almond-4">
                                    {formatDate(notification.created_at)}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-cosmos-400 hover:bg-cosmos-500 text-white text-sm font-semibold rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

