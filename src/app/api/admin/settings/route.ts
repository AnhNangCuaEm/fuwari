import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import { getAllSettings, updateSettingsBulk } from '@/lib/settings';

// GET /api/admin/settings  – return all settings grouped
export async function GET() {
    try {
        const user = await requireAdmin();
        void user; // just verifies admin access

        const settings = await getAllSettings();

        // Group by group_name
        const grouped = settings.reduce<Record<string, typeof settings>>((acc, s) => {
            if (!acc[s.group_name]) acc[s.group_name] = [];
            acc[s.group_name].push(s);
            return acc;
        }, {});

        return NextResponse.json({ settings, grouped });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Admin access required')
                return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
            if (error.message === 'Authentication required')
                return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        console.error('GET /api/admin/settings error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// PUT /api/admin/settings  – bulk update { updates: Record<key,value> }
export async function PUT(request: NextRequest) {
    try {
        const user = await requireAdmin();

        const body = await request.json();
        const updates: Record<string, string> = body.updates;

        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
        }

        const result = await updateSettingsBulk(updates, user.id);

        if (!result.success) {
            return NextResponse.json({ message: 'Some settings failed to update', errors: result.errors, updatedCount: result.updatedCount },
                { status: 207 }
            );
        }

        const apiResponse = NextResponse.json({ message: 'Settings saved successfully', updatedCount: result.updatedCount });

        // Short TTL so the cache expires quickly when toggled back
        if ('maintenance_mode' in updates) {
            const isMaintenanceOn = updates.maintenance_mode === 'true';
            apiResponse.cookies.set('fuwari-maintenance', isMaintenanceOn ? 'true' : 'false', {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60, // 60 seconds — re-reads DB after TTL expires
                secure: process.env.NODE_ENV === 'production',
            });
        }

        return apiResponse;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Admin access required')
                return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
            if (error.message === 'Authentication required')
                return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }
        console.error('PUT /api/admin/settings error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
