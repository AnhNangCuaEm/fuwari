import { getSetting } from '@/lib/settings'
import AnnouncementBannerClient from './AnnouncementBannerClient'

export const dynamic = 'force-dynamic'

// Server component — reads banner settings from DB on every request
export default async function AnnouncementBanner() {
    const enabled = await getSetting('banner_enabled')
    if (enabled !== 'true') return null

    const [text, bgColor, textColor, dismissible, linkUrl, linkLabel] = await Promise.all([
        getSetting('banner_text'),
        getSetting('banner_bg_color'),
        getSetting('banner_text_color'),
        getSetting('banner_dismissible'),
        getSetting('banner_link_url'),
        getSetting('banner_link_label'),
    ])

    return (
        <AnnouncementBannerClient
            text={text ?? 'Welcome to Fuwari! 🎉'}
            bgColor={bgColor ?? '#4F46E5'}
            textColor={textColor ?? '#FFFFFF'}
            dismissible={dismissible === 'true'}
            linkUrl={linkUrl ?? undefined}
            linkLabel={linkLabel ?? undefined}
        />
    )
}

