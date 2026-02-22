import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET /api/notifications/ably-token
// Get Ably token for client
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.ABLY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ message: 'Ably not configured' }, { status: 500 })
    }

    // Extract keyName and keySecret
    const colonIndex = apiKey.indexOf(':')
    const keySecret = apiKey.substring(colonIndex + 1)

    // Return keySecret (only the part after the :) for the client to use with keyName
    return NextResponse.json({ token: keySecret })
  } catch (error) {
    console.error('Error generating Ably token:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
