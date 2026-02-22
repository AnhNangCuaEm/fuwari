'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationItem {
  id: string
  title: string
  body: string
  type: string
  is_mandatory: boolean
  target_type: 'all' | 'specific'
  created_at: string
  recipient_count: number
  read_count: number
}

interface UserItem {
  id: string
  name: string
  email: string
}

const typeOptions = [
  { value: 'general', label: 'General' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'order',   label: 'Order' },
  { value: 'promo',   label: 'Promo' },
  { value: 'system',  label: 'System' },
]

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form state
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'general',
    is_mandatory: false,
    target_type: 'all' as 'all' | 'specific',
    target_user_ids: [] as string[],
  })
  const [userSearch, setUserSearch] = useState('')

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {
      setErrorMsg('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      console.error('Failed to load users')
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, [fetchNotifications, fetchUsers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      setErrorMsg('Title and body are required')
      return
    }
    setIsSending(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to send')
      }
      setSuccessMsg('Notification sent successfully!')
      setForm({ title: '', body: '', type: 'general', is_mandatory: false, target_type: 'all', target_user_ids: [] })
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchNotifications()
      setActiveTab('list')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return
    try {
      await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch {
      setErrorMsg('Failed to delete')
    }
  }

  const toggleUserSelection = (userId: string) => {
    setForm(prev => ({
      ...prev,
      target_user_ids: prev.target_user_ids.includes(userId)
        ? prev.target_user_ids.filter(id => id !== userId)
        : [...prev.target_user_ids, userId],
    }))
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and send notifications to users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['list', 'create'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'list' ? 'All Notifications' : 'Create New'}
          </button>
        ))}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
          >
            ✅ {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          >
            ❌ {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab: List */}
      {activeTab === 'list' && (
        <div>
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No notifications yet. Create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-800">{n.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{n.type}</span>
                        {n.is_mandatory && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Mandatory</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          n.target_type === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {n.target_type === 'all' ? 'All users' : 'Specific'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{n.body}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                        <span>{n.recipient_count} recipients</span>
                        <span>{n.read_count} read</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Create */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Notification title..."
              maxLength={255}
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
            <textarea
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows={4}
              placeholder="Notification content..."
            />
          </div>

          {/* Type + Mandatory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {typeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_mandatory}
                  onChange={e => setForm(p => ({ ...p, is_mandatory: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Mandatory</span>
              </label>
              <p className="text-xs text-gray-400 ml-6">Auto-send to new users</p>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target</label>
            <div className="flex gap-4">
              {(['all', 'specific'] as const).map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target_type"
                    value={t}
                    checked={form.target_type === t}
                    onChange={() => setForm(p => ({ ...p, target_type: t, target_user_ids: [] }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {t === 'all' ? 'All users' : 'Specific users'}
                  </span>
                </label>
              ))}
            </div>

            {/* User picker */}
            {form.target_type === 'specific' && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.target_user_ids.includes(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {form.target_user_ids.length > 0 && (
                  <div className="px-3 py-2 bg-blue-50 border-t border-gray-100 text-xs text-blue-600 font-medium">
                    {form.target_user_ids.length} user(s) selected
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
