import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { createContactMessage } from '@/lib/contacts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Get current user if logged in (optional)
    const currentUser = await getCurrentUser()

    const contact = await createContactMessage({
      name,
      email,
      phone: phone || undefined,
      subject,
      message,
      user_id: currentUser?.id || null,
    })

    return NextResponse.json({ message: 'Message sent successfully', contact }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
