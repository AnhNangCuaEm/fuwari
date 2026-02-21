import { getSetting } from '@/lib/settings'
export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
    const title = (await getSetting('maintenance_title')) ?? "We'll be back soon!"
    const message = (await getSetting('maintenance_message')) ?? 'We are currently performing scheduled maintenance. Please check back later.'
    const estimatedTime = await getSetting('maintenance_estimated_time')

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10 text-center">
                {/* Icon */}
                <div className="text-6xl mb-6">🔧</div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-3">{title}</h1>

                {/* Message */}
                <p className="text-gray-600 leading-relaxed mb-6">{message}</p>

                {/* Estimated time */}
                {estimatedTime && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-6 text-sm text-orange-700">
                        <span className="font-semibold">Estimated completion: </span>
                        {new Date(estimatedTime).toLocaleString('en-US', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </div>
                )}

                {/* Progress animation */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
                    <div className="h-2 bg-orange-400 rounded-full animate-pulse w-2/3" />
                </div>
            </div>
        </div>
    )
}
