'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SiteSetting } from '@/lib/settings'

type SettingsMap = Record<string, string>

// ─── Reusable primitives ──────────────────────────────────────────────────────

const SectionCard = ({ title, icon, accent, children }: {
    title: string; icon: string; accent: string; children: React.ReactNode
}) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 ${accent}`}>
            <span className="text-xl">{icon}</span>
            <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
        </div>
        <div className="p-6 space-y-5">{children}</div>
    </div>
)

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
        {children}
    </div>
)

const TextInput = ({ value, onChange, placeholder, maxLength }: {
    value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number
}) => (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
)

const Textarea = ({ value, onChange, placeholder, rows = 3, maxLength }: {
    value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number
}) => (
    <div className="relative">
        <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={rows} maxLength={maxLength}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 focus:bg-white resize-none transition-colors" />
        {maxLength && (
            <span className="absolute bottom-2 right-3 text-xs text-gray-300 pointer-events-none">
                {value.length}/{maxLength}
            </span>
        )}
    </div>
)

const Toggle = ({ value, onChange, label, description, color = 'indigo' }: {
    value: string; onChange: (v: string) => void; label: string; description?: string; color?: string
}) => {
    const on = value === 'true'
    const bg = on
        ? color === 'orange' ? 'bg-orange-500' : 'bg-indigo-500'
        : 'bg-gray-200'
    return (
        <div className="flex items-center justify-between gap-4 py-2">
            <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(on ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${bg}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    )
}

const ColorPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
            className="h-9 w-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-gray-50" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
            maxLength={7} placeholder="#000000"
            className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition-colors" />
        {value && (
            <span className="text-xs text-gray-400 font-mono"
                style={{ color: value }}>{value}</span>
        )}
    </div>
)

// ─── Maintenance Section ──────────────────────────────────────────────────────

const MaintenanceSection = ({ v, set }: { v: SettingsMap; set: (k: string, val: string) => void }) => {
    const on = v.maintenance_mode === 'true'
    return (
        <SectionCard title="Maintenance Mode" icon="🔧" accent={on ? 'bg-orange-50' : 'bg-gray-50'}>
            {/* Master toggle */}
            <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${on ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                <div>
                    <p className="font-semibold text-gray-800 text-sm">
                        {on ? '⚠️  Site is under maintenance' : '✅  Site is live'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {on ? 'Non-admin visitors are redirected to the maintenance page.' : 'All visitors can access the site normally.'}
                    </p>
                </div>
                <button type="button"
                    onClick={() => set('maintenance_mode', on ? 'false' : 'true')}
                    className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${on ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${on ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Page Title" hint="Large heading shown to visitors.">
                    <TextInput value={v.maintenance_title ?? ''} onChange={val => set('maintenance_title', val)}
                        placeholder="We'll be back soon!" maxLength={80} />
                </Field>
                <Field label="Estimated End Time" hint="Leave blank to hide. Shown as a countdown hint.">
                    <input type="datetime-local" value={v.maintenance_estimated_time ?? ''}
                        onChange={e => set('maintenance_estimated_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition-colors" />
                </Field>
            </div>

            <Field label="Message" hint="Body text displayed below the title.">
                <Textarea value={v.maintenance_message ?? ''} onChange={val => set('maintenance_message', val)}
                    placeholder="We are currently performing scheduled maintenance. Please check back later."
                    rows={3} maxLength={400} />
            </Field>

            {/* Live preview */}
            <div className="rounded-xl border border-dashed border-orange-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-center">
                <p className="text-xs font-semibold text-orange-300 uppercase tracking-widest mb-3">Page Preview</p>
                <div className="text-4xl mb-2">🔧</div>
                <p className="font-bold text-gray-800">{v.maintenance_title || "We'll be back soon!"}</p>
                <p className="text-gray-500 text-xs mt-1.5 max-w-xs mx-auto">
                    {v.maintenance_message || 'We are currently performing scheduled maintenance.'}
                </p>
                {v.maintenance_estimated_time && (
                    <p className="text-orange-500 text-xs mt-2 font-medium">
                        Back by {new Date(v.maintenance_estimated_time).toLocaleString()}
                    </p>
                )}
                <div className="mt-3 h-1.5 w-24 mx-auto rounded-full bg-orange-200 overflow-hidden">
                    <div className="h-full w-2/3 bg-orange-400 rounded-full animate-pulse" />
                </div>
            </div>
        </SectionCard>
    )
}

// ─── Banner Section ───────────────────────────────────────────────────────────

const BannerSection = ({ v, set }: { v: SettingsMap; set: (k: string, val: string) => void }) => {
    const on = v.banner_enabled === 'true'
    const bg = v.banner_bg_color || '#4F46E5'
    const fg = v.banner_text_color || '#FFFFFF'

    return (
        <SectionCard title="Announcement Banner" icon="📢" accent="bg-indigo-50">
            <Toggle value={v.banner_enabled ?? 'false'} onChange={val => set('banner_enabled', val)}
                label="Enable Banner" description="Show an announcement strip at the bottom of all pages." />

            <div className={`space-y-4 transition-opacity ${on ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <Field label="Message" hint="Text shown inside the banner (supports emoji 🎉).">
                    <TextInput value={v.banner_text ?? ''} onChange={val => set('banner_text', val)}
                        placeholder="Free shipping on orders over ¥5,000! 🎉" maxLength={120} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Background Color">
                        <ColorPicker value={v.banner_bg_color ?? '#4F46E5'} onChange={val => set('banner_bg_color', val)} />
                    </Field>
                    <Field label="Text Color">
                        <ColorPicker value={v.banner_text_color ?? '#FFFFFF'} onChange={val => set('banner_text_color', val)} />
                    </Field>
                </div>

                <Field label="Options">
                    <Toggle value={v.banner_dismissible ?? 'true'} onChange={val => set('banner_dismissible', val)}
                        label="Dismissible" description="Visitors can close the banner." />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Link URL" hint="Optional — leave blank for no link.">
                        <TextInput value={v.banner_link_url ?? ''} onChange={val => set('banner_link_url', val)}
                            placeholder="https://fuwari.com/products" />
                    </Field>
                    <Field label="Link Label">
                        <TextInput value={v.banner_link_label ?? ''} onChange={val => set('banner_link_label', val)}
                            placeholder="Shop now →" maxLength={30} />
                    </Field>
                </div>

                {/* Live preview */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Live Preview</p>
                    <div className={`rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 text-sm font-medium shadow-sm`}
                        style={{ backgroundColor: bg, color: fg }}>
                        <span className="flex-1 text-center">
                            {v.banner_text || 'Free shipping on orders over ¥5,000! 🎉'}
                            {v.banner_link_url && v.banner_link_label && (
                                <span className="ml-2 underline opacity-80">{v.banner_link_label}</span>
                            )}
                        </span>
                        {v.banner_dismissible === 'true' && (
                            <span className="opacity-60 text-base leading-none cursor-default">✕</span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        Will appear fixed at the <strong>bottom</strong> of every page.
                    </p>
                </div>
            </div>
        </SectionCard>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsClient() {
    const [values, setValues] = useState<SettingsMap>({})
    const [original, setOriginal] = useState<SettingsMap>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 4000)
    }

    const fetchSettings = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings')
            if (!res.ok) throw new Error()
            const data = await res.json()
            const map: SettingsMap = {}
            for (const s of (data.settings as SiteSetting[])) map[s.key] = s.value
            setValues(map)
            setOriginal(map)
        } catch {
            showToast('error', 'Failed to load settings.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchSettings() }, [fetchSettings])

    const set = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }))
    const isDirty = JSON.stringify(values) !== JSON.stringify(original)

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: values }),
            })
            const data = await res.json()
            if (!res.ok && res.status !== 207) throw new Error(data.message)
            setOriginal({ ...values })
            setLastSaved(new Date())
            showToast('success', 'Settings saved successfully.')
        } catch (err) {
            showToast('error', err instanceof Error ? err.message : 'Failed to save.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <svg className="w-7 h-7 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading settings…
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Site Settings</h1>
                    <p className="text-gray-400 text-sm mt-0.5">
                        {lastSaved ? `Last saved at ${lastSaved.toLocaleTimeString()}` : 'Manage maintenance mode and announcement banners.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isDirty && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full font-medium">
                            Unsaved changes
                        </span>
                    )}
                    <button onClick={() => setValues({ ...original })} disabled={!isDirty || saving}
                        className="px-4 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        Reset
                    </button>
                    <button onClick={handleSave} disabled={!isDirty || saving}
                        className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {saving
                            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving…</>
                            : <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </>
                        }
                    </button>
                </div>
            </div>

            {/* Active maintenance warning */}
            {values.maintenance_mode === 'true' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-sm text-orange-700">
                        <strong>Maintenance mode is ON.</strong> Non-admin visitors are currently being redirected.
                        Save with the toggle disabled to restore access.
                    </p>
                </div>
            )}

            {/* Two cards */}
            <MaintenanceSection v={values} set={set} />
            <BannerSection v={values} set={set} />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-medium ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}
        </div>
    )
}
