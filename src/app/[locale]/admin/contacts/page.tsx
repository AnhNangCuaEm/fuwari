'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContactMessage } from '@/types/contact'
import ContactDetailModal from '@/components/admin/ContactDetailModal'

type Filter = 'all' | 'pending' | 'replied'

/* ── Status badge ── */
const StatusBadge = ({ status }: { status: ContactMessage['status'] }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      status === 'replied'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {status === 'replied' ? (
      <>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Replied
      </>
    ) : (
      <>
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Pending
      </>
    )}
  </span>
)

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/contacts')
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages)
      } else {
        setError(data.message || 'Failed to fetch messages')
      }
    } catch {
      setError('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleUpdated = (updated: ContactMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    setSelected(updated)
  }

  const filtered = messages.filter((m) => {
    if (filter === 'pending') return m.status === 'pending'
    if (filter === 'replied') return m.status === 'replied'
    return true
  })

  const pendingCount = messages.filter((m) => m.status === 'pending').length
  const repliedCount = messages.filter((m) => m.status === 'replied').length

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-indigo-600" />
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Contact Messages</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {messages.length} total &bull;{' '}
              <span className="text-yellow-600 font-medium">{pendingCount} pending</span>{' '}
              &bull;{' '}
              <span className="text-green-600 font-medium">{repliedCount} replied</span>
            </p>
          </div>
          <button
            onClick={fetchMessages}
            title="Refresh"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(['all', 'pending', 'replied'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f === 'all' && `All (${messages.length})`}
              {f === 'pending' && `Pending (${pendingCount})`}
              {f === 'replied' && `Replied (${repliedCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50 mt-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
            >
              {/* Avatar initials */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                {msg.name.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900">{msg.name}</p>
                  <p className="text-xs text-gray-400">{msg.email}</p>
                  {msg.phone && <p className="text-xs text-gray-400">· {msg.phone}</p>}
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">{msg.subject}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{msg.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Status + action */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={msg.status} />
                <button
                  onClick={() => { setSelected(msg); setIsModalOpen(true) }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            {filter === 'all'
              ? 'No contact messages yet.'
              : `No ${filter} messages.`}
          </div>
        )}
      </div>

      {/* Detail / reply modal */}
      <ContactDetailModal
        contact={selected}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelected(null) }}
        onUpdated={handleUpdated}
      />
    </>
  )
}
