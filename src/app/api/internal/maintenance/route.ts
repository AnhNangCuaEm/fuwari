import { NextResponse } from 'next/server'
import { isMaintenanceMode } from '@/lib/settings'

// Lightweight internal endpoint — only called by the middleware
// No auth needed since it only returns a boolean and is not sensitive
export async function GET() {
    try {
        const active = await isMaintenanceMode()
        const res = NextResponse.json({ active })
        // Short-lived cache so it doesn't hammer the DB on every request
        res.headers.set('Cache-Control', 'no-store')
        return res
    } catch {
        // If DB is unreachable, assume maintenance is OFF (fail open)
        return NextResponse.json({ active: false })
    }
}
