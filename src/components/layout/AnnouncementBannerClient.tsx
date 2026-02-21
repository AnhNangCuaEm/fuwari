'use client'

import { useState } from 'react'

interface AnnouncementBannerProps {
    text: string
    bgColor: string
    textColor: string
    dismissible: boolean
    linkUrl?: string
    linkLabel?: string
}

export default function AnnouncementBannerClient({
    text,
    bgColor,
    textColor,
    dismissible,
    linkUrl,
    linkLabel,
}: AnnouncementBannerProps) {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div
            style={{ backgroundColor: bgColor, color: textColor }}
            className="fixed bottom-0 left-0 right-0 w-full z-[60] py-2 px-4 text-sm font-medium shadow-[0_-2px_8px_rgba(0,0,0,0.12)]"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <span className="text-center leading-snug">
                    {text}
                    {linkUrl && linkLabel && (
                        <a
                            href={linkUrl}
                            className="ml-2 underline underline-offset-2 opacity-90 hover:opacity-100 font-semibold"
                        >
                            {linkLabel}
                        </a>
                    )}
                </span>

                {dismissible && (
                    <button
                        onClick={() => setDismissed(true)}
                        aria-label="Close announcement"
                        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity text-base leading-none ml-2"
                        style={{ color: textColor }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}
