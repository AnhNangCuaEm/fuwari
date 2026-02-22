'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import type { NotificationWithStatus } from '@/lib/notifications'
import type { Realtime } from 'ably'

export function useNotifications() {
  const { data: session, status } = useSession()
  const [notifications, setNotifications] = useState<NotificationWithStatus[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ablyRef = useRef<Realtime | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      const unread = (data.notifications || []).filter((n: NotificationWithStatus) => !n.is_read).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }, [status])

  const fetchUnreadCount = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      const res = await fetch('/api/notifications/unread-count')
      if (!res.ok) return
      const data = await res.json()
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }, [status])

  const markAllAsRead = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [status])

  // Fetch initial notifications and unread count on auth
  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [status, fetchNotifications, fetchUnreadCount])

  // Setup Ably realtime subscription
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return

    const keyName = process.env.NEXT_PUBLIC_ABLY_KEY_NAME
    if (!keyName) return

    const userId = session.user.id

    let isMounted = true

    async function setupAbly() {
      try {
        const { Realtime } = await import('ably')
        const client = new Realtime({
          key: `${keyName}:${await getAblyToken()}`,
        })
        ablyRef.current = client

        // Subscribe channel (all users)
        const allChannel = client.channels.get('notifications-all')
        await allChannel.subscribe('new-notification', () => {
          if (isMounted) fetchUnreadCount()
        })

        // Subscribe channel (specific user)
        const userChannel = client.channels.get(`notifications-user-${userId}`)
        await userChannel.subscribe('new-notification', () => {
          if (isMounted) fetchUnreadCount()
        })
      } catch (err) {
        console.error('Ably setup error:', err)
      }
    }

    setupAbly()

    return () => {
      isMounted = false
      ablyRef.current?.close()
      ablyRef.current = null
    }
  }, [status, session?.user?.id, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
  }
}

// Get Ably token
async function getAblyToken(): Promise<string> {
  try {
    const res = await fetch('/api/notifications/ably-token')
    if (!res.ok) throw new Error('Failed to get token')
    const data = await res.json()
    return data.token
  } catch {
    return ''
  }
}
