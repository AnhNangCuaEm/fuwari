-- =====================================================
-- Notifications System Migration
-- =====================================================

-- Notifications table: save notification content
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  -- is_mandatory: true = auto send to all new users
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  -- target_type: 'all' = broadcast, 'specific' = specific user
  target_type VARCHAR(20) NOT NULL DEFAULT 'all',
  created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification recipients table: user read status for each notification
CREATE TABLE IF NOT EXISTS notification_recipients (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  notification_id VARCHAR(36) NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_is_read ON notification_recipients(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_is_mandatory ON notifications(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
