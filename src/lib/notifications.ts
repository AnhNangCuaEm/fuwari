import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from './db';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_mandatory: boolean;
  target_type: 'all' | 'specific';
  created_by: string | null;
  created_at: string;
}

export interface NotificationWithStatus extends Notification {
  is_read: boolean;
  read_at: string | null;
  recipient_id: string;
}

export interface CreateNotificationData {
  title: string;
  body: string;
  type?: string;
  is_mandatory?: boolean;
  target_type?: 'all' | 'specific';
  target_user_ids?: string[];
  created_by?: string;
}

// =====================================================
// ADMIN: Create a new notification and assign to recipients
// =====================================================
export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const id = uuidv4();
  const type = data.type || 'general';
  const is_mandatory = data.is_mandatory ?? false;
  const target_type = data.target_type || 'all';

  // Insert notification
  const notification = await queryOne<Notification>(
    `INSERT INTO notifications (id, title, body, type, is_mandatory, target_type, created_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [id, data.title, data.body, type, is_mandatory, target_type, data.created_by || null]
  );

  if (!notification) throw new Error('Failed to create notification');

  // Send to recipients
  if (target_type === 'all') {
    // Send to all active users
    await query(
      `INSERT INTO notification_recipients (id, notification_id, user_id, is_read, created_at)
       SELECT gen_random_uuid()::VARCHAR, $1, id, FALSE, NOW()
       FROM users
       WHERE status = 'active'
       ON CONFLICT (notification_id, user_id) DO NOTHING`,
      [id]
    );
  } else if (target_type === 'specific' && data.target_user_ids?.length) {
    // Send to specific users
    for (const userId of data.target_user_ids) {
      await query(
        `INSERT INTO notification_recipients (id, notification_id, user_id, is_read, created_at)
         VALUES (gen_random_uuid()::VARCHAR, $1, $2, FALSE, NOW())
         ON CONFLICT (notification_id, user_id) DO NOTHING`,
        [id, userId]
      );
    }
  }

  return notification;
}

// =====================================================
// USER: Get user notifications
// =====================================================
export async function getUserNotifications(userId: string): Promise<NotificationWithStatus[]> {
  const rows = await query<NotificationWithStatus[]>(
    `SELECT 
       n.id, n.title, n.body, n.type, n.is_mandatory, n.target_type, n.created_by, n.created_at,
       nr.id as recipient_id, nr.is_read, nr.read_at
     FROM notification_recipients nr
     JOIN notifications n ON n.id = nr.notification_id
     WHERE nr.user_id = $1
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return rows;
}

// =====================================================
// USER: Get unread notifications count
// =====================================================
export async function getUnreadCount(userId: string): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM notification_recipients
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return parseInt(row?.count || '0', 10);
}

// =====================================================
// USER: Mark all as read
// =====================================================
export async function markAllAsRead(userId: string): Promise<void> {
  await query(
    `UPDATE notification_recipients
     SET is_read = TRUE, read_at = NOW()
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

// =====================================================
// USER: Mark a notification as read
// =====================================================
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  await query(
    `UPDATE notification_recipients
     SET is_read = TRUE, read_at = NOW()
     WHERE notification_id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
}

// =====================================================
// ADMIN: Get all notifications
// =====================================================
export async function getAllNotifications(): Promise<(Notification & { recipient_count: number; read_count: number })[]> {
  const rows = await query<(Notification & { recipient_count: number; read_count: number })[]>(
    `SELECT 
       n.*,
       COUNT(nr.id)::INT as recipient_count,
       COUNT(CASE WHEN nr.is_read = TRUE THEN 1 END)::INT as read_count
     FROM notifications n
     LEFT JOIN notification_recipients nr ON nr.notification_id = n.id
     GROUP BY n.id
     ORDER BY n.created_at DESC`
  );
  return rows;
}

// =====================================================
// ADMIN: Delete a notification
// =====================================================
export async function deleteNotification(id: string): Promise<void> {
  await query('DELETE FROM notifications WHERE id = $1', [id]);
}

// =====================================================
// INTERNAL: Send mandatory notifications to new user
// =====================================================
export async function sendMandatoryNotificationsToNewUser(userId: string): Promise<void> {
  // Get all notifications is_mandatory = true
  const mandatoryNotifications = await query<Notification[]>(
    `SELECT * FROM notifications WHERE is_mandatory = TRUE`
  );

  for (const notif of mandatoryNotifications) {
    await query(
      `INSERT INTO notification_recipients (id, notification_id, user_id, is_read, created_at)
       VALUES (gen_random_uuid()::VARCHAR, $1, $2, FALSE, NOW())
       ON CONFLICT (notification_id, user_id) DO NOTHING`,
      [notif.id, userId]
    );
  }
}
