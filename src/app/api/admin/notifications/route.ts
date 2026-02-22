import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { createNotification, getAllNotifications, deleteNotification } from '@/lib/notifications'

// GET /api/admin/notifications — Get all notifications (admin)
export async function GET() {
  try {
    await requireAdmin()
    const notifications = await getAllNotifications()
    return NextResponse.json({ notifications })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/notifications — Create new notification
export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin()
    const body = await request.json()

    const { title, body: notifBody, type, is_mandatory, target_type, target_user_ids } = body

    if (!title?.trim() || !notifBody?.trim()) {
      return NextResponse.json({ message: 'Title and body are required' }, { status: 400 })
    }

    if (target_type === 'specific' && (!target_user_ids || target_user_ids.length === 0)) {
      return NextResponse.json({ message: 'target_user_ids required for specific target' }, { status: 400 })
    }

    const notification = await createNotification({
      title: title.trim(),
      body: notifBody.trim(),
      type: type || 'general',
      is_mandatory: !!is_mandatory,
      target_type: target_type || 'all',
      target_user_ids,
      created_by: adminUser.id,
    })

    // Publish Ably event to push realtime for clients
    await publishNotificationEvent(notification.id, target_type, target_user_ids)

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    console.error('Error creating notification:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/notifications?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 })
    }

    await deleteNotification(id)
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    console.error('Error deleting notification:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// Publish Ably realtime event
async function publishNotificationEvent(
  notificationId: string,
  targetType: string,
  targetUserIds?: string[]
) {
  const apiKey = process.env.ABLY_API_KEY
  if (!apiKey) return

  try {
    const authHeader = 'Basic ' + Buffer.from(apiKey).toString('base64')

    const payload = {
      name: 'new-notification',
      data: JSON.stringify({ notificationId, targetType, targetUserIds }),
    }

    if (targetType === 'all') {
      // Publish to all users channel
      await fetch(`https://rest.ably.io/channels/notifications-all/messages`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } else if (targetType === 'specific' && targetUserIds) {
      // Publish to each user's specific channel
      for (const userId of targetUserIds) {
        await fetch(`https://rest.ably.io/channels/notifications-user-${userId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }
    }
  } catch (err) {
    console.error('Ably publish error:', err)
  }
}
