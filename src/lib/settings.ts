/**
 * Site Settings Library
 * CRUD operations for the site_settings table
 */

import { query, queryOne } from './db';

export interface SiteSetting {
    key: string;
    value: string;
    type: 'string' | 'boolean' | 'number' | 'json';
    label: string;
    description?: string;
    group_name: string;
    updated_at: string;
    updated_by?: string;
}

export interface SettingsGroup {
    group_name: string;
    settings: SiteSetting[];
}

// ============================================================
// READ
// ============================================================

/** Get all settings as a flat array */
export async function getAllSettings(): Promise<SiteSetting[]> {
    try {
        return await query<SiteSetting[]>(
            'SELECT * FROM site_settings ORDER BY group_name, key'
        );
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return [];
    }
}

/** Get all settings grouped by group_name */
export async function getSettingsGrouped(): Promise<Record<string, SiteSetting[]>> {
    const settings = await getAllSettings();
    return settings.reduce<Record<string, SiteSetting[]>>((acc, s) => {
        if (!acc[s.group_name]) acc[s.group_name] = [];
        acc[s.group_name].push(s);
        return acc;
    }, {});
}

/** Get a single setting value by key */
export async function getSetting(key: string): Promise<string | null> {
    try {
        const row = await queryOne<{ value: string }>(
            'SELECT value FROM site_settings WHERE key = $1',
            [key]
        );
        return row?.value ?? null;
    } catch (error) {
        console.error(`Error fetching setting "${key}":`, error);
        return null;
    }
}

/** Get a boolean setting */
export async function getBooleanSetting(key: string, defaultValue = false): Promise<boolean> {
    const val = await getSetting(key);
    if (val === null) return defaultValue;
    return val === 'true';
}

/** Get a number setting */
export async function getNumberSetting(key: string, defaultValue = 0): Promise<number> {
    const val = await getSetting(key);
    if (val === null) return defaultValue;
    const n = Number(val);
    return isNaN(n) ? defaultValue : n;
}

/** Check if maintenance mode is active */
export async function isMaintenanceMode(): Promise<boolean> {
    return getBooleanSetting('maintenance_mode', false);
}

// ============================================================
// WRITE
// ============================================================

/** Update a single setting */
export async function updateSetting(
    key: string,
    value: string,
    updatedBy?: string
): Promise<boolean> {
    try {
        await query(
            `UPDATE site_settings
             SET value = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2
             WHERE key = $3`,
            [value, updatedBy ?? null, key]
        );
        return true;
    } catch (error) {
        console.error(`Error updating setting "${key}":`, error);
        return false;
    }
}

/** Bulk update settings – takes a Record<key, value> object */
export async function updateSettingsBulk(
    updates: Record<string, string>,
    updatedBy?: string
): Promise<{ success: boolean; updatedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let updatedCount = 0;

    for (const [key, value] of Object.entries(updates)) {
        const ok = await updateSetting(key, value, updatedBy);
        if (ok) {
            updatedCount++;
        } else {
            errors.push(key);
        }
    }

    return { success: errors.length === 0, updatedCount, errors };
}
