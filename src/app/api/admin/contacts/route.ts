import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import {
  getContactMessages,
  replyToContactMessage,
  markContactAsPending,
} from '@/lib/contacts'

export async function GET() {
  try {
    await requireAdmin()
    const messages = await getContactMessages()
    return NextResponse.json({ messages, count: messages.length })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Admin access required')
        return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
      if (error.message === 'Authentication required')
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error fetching contact messages:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const { id, action, admin_reply } = body

    if (!id || !action) {
      return NextResponse.json({ message: 'id and action are required' }, { status: 400 })
    }

    let updated = null

    if (action === 'reply') {
      if (!admin_reply?.trim()) {
        return NextResponse.json({ message: 'Reply text is required' }, { status: 400 })
      }
      updated = await replyToContactMessage({
        id,
        admin_reply: admin_reply.trim(),
        replied_by: admin.email,
      })
    } else if (action === 'markPending') {
      updated = await markContactAsPending(id)
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    }

    if (!updated) {
      return NextResponse.json({ message: 'Contact message not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Updated successfully', contact: updated })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Admin access required')
        return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
      if (error.message === 'Authentication required')
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error updating contact message:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
