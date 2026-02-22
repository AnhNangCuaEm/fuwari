import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserNotifications } from '@/lib/notifications'

// GET /api/notifications — Get user notifications
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await getUserNotifications(session.user.id)
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
