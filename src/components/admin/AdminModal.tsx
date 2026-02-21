'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export interface AdminModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    /** Optional subtitle displayed below the title */
    subtitle?: string
    children: React.ReactNode
    /** Max width class, e.g. 'max-w-lg', 'max-w-2xl'. Defaults to 'max-w-2xl' */
    maxWidth?: string
    /** Footer slot — pass action buttons here */
    footer?: React.ReactNode
}

/**
 * AdminModal — generic reusable modal for admin pages.
 * Supports keyboard (Escape) close, scroll-lock, and portal rendering.
 */
export default function AdminModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'max-w-2xl',
    footer,
}: AdminModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    /* ── keyboard & scroll-lock ── */
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    /* ── backdrop click ── */
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) onClose()
    }

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    onClick={handleBackdropClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="ml-4 mt-0.5 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    if (typeof window === 'undefined') return null
    return createPortal(modal, document.body)
}
