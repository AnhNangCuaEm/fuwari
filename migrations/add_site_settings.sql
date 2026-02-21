-- Migration: Add site_settings table
-- Created: 2026-02-21

CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'string', -- string | boolean | number | json
    label VARCHAR(255) NOT NULL,
    description TEXT,
    group_name VARCHAR(100) NOT NULL DEFAULT 'general',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36) DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_settings_group ON site_settings (group_name);

-- ====================================
-- Default settings
-- ====================================

-- MAINTENANCE
INSERT INTO site_settings (key, value, type, label, description, group_name) VALUES
('maintenance_mode',          'false',                                                                       'boolean', 'Maintenance Mode',     'Redirect all non-admin visitors to a maintenance page.',   'maintenance'),
('maintenance_title',         'We''ll be back soon!',                                                       'string',  'Page Title',           'Large heading shown on the maintenance page.',             'maintenance'),
('maintenance_message',       'We are currently performing scheduled maintenance. Please check back later.', 'string',  'Message',              'Body text shown to visitors during maintenance.',          'maintenance'),
('maintenance_estimated_time','',                                                                            'string',  'Estimated End Time',   'Optional ISO datetime shown as estimated completion time.','maintenance')
ON CONFLICT (key) DO NOTHING;

-- ANNOUNCEMENT BANNER
INSERT INTO site_settings (key, value, type, label, description, group_name) VALUES
('banner_enabled',     'false',                                    'boolean', 'Banner Enabled',    'Show the announcement banner across all pages.',            'banner'),
('banner_text',        'Free shipping on orders over ¥5,000! 🎉', 'string',  'Banner Text',       'Message displayed inside the banner.',                      'banner'),
('banner_bg_color',    '#4F46E5',                                  'string',  'Background Color',  'Hex background color of the banner.',                       'banner'),
('banner_text_color',  '#FFFFFF',                                  'string',  'Text Color',        'Hex text color inside the banner.',                         'banner'),
('banner_dismissible', 'true',                                     'boolean', 'Dismissible',       'Allow visitors to close/hide the banner.',                  'banner'),
('banner_link_url',    '',                                         'string',  'Link URL',          'Optional URL the banner links to (leave blank for none).',  'banner'),
('banner_link_label',  'Shop now →',                               'string',  'Link Label',        'Label for the banner call-to-action link.',                 'banner')
ON CONFLICT (key) DO NOTHING;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();
