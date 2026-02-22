import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { markAllAsRead } from '@/lib/notifications'

// PATCH /api/notifications/read-all — Mark all as read
export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await markAllAsRead(session.user.id)
    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
