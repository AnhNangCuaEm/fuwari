'use client'

import { useState } from 'react'
import AdminModal from '@/components/admin/AdminModal'
import { ContactMessage } from '@/types/contact'

interface ContactDetailModalProps {
  contact: ContactMessage | null
  isOpen: boolean
  onClose: () => void
  onUpdated: (updated: ContactMessage) => void
}

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-0.5 p-3 bg-gray-50 rounded-xl">
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
      {value || 'N/A'}
    </span>
  </div>
)

export default function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  onUpdated,
}: ContactDetailModalProps) {
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!contact) return null

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id, action: 'reply', admin_reply: replyText }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdated(data.contact)
        setReplyText('')
      } else {
        setError(data.message || 'Failed to send reply')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    setSubmitting(true)
    setError(null)
    const action = contact.status === 'replied' ? 'markPending' : 'reply'
    // For marking pending we use dedicated action; for quick mark-replied without reply text not allowed
    if (action === 'reply') return
    try {
      const res = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contact.id, action: 'markPending' }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdated(data.contact)
      } else {
        setError(data.message || 'Failed to update status')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Mark as pending toggle (only if already replied) */}
      {contact.status === 'replied' && (
        <button
          onClick={handleToggleStatus}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Mark as Pending
        </button>
      )}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Message"
      subtitle={`From ${contact.name} · ${new Date(contact.createdAt).toLocaleString()}`}
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <div className="p-6 space-y-5 overflow-y-auto">
        {/* Sender info */}
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Name" value={contact.name} />
          <InfoRow label="Email" value={contact.email} />
          {contact.phone && <InfoRow label="Phone" value={contact.phone} />}
          <InfoRow
            label="Status"
            value={contact.status === 'replied' ? '✅ Replied' : '⏳ Pending'}
          />
        </div>

        {/* Subject */}
        <div className="p-3 bg-gray-50 rounded-xl">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
            Subject
          </span>
          <p className="text-sm font-semibold text-gray-900">{contact.subject}</p>
        </div>

        {/* Message */}
        <div className="p-3 bg-gray-50 rounded-xl">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
            Message
          </span>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {contact.message}
          </p>
        </div>

        {/* Existing reply */}
        {contact.admin_reply && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-xs font-semibold text-green-700">Admin Reply</span>
              {contact.replied_by && (
                <span className="text-xs text-green-500 ml-1">by {contact.replied_by}</span>
              )}
              {contact.replied_at && (
                <span className="text-xs text-green-500 ml-auto">
                  {new Date(contact.replied_at).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-green-800 whitespace-pre-wrap pl-6">{contact.admin_reply}</p>
          </div>
        )}

        {/* Reply compose box */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
            {contact.admin_reply ? 'Update Reply' : 'Write a Reply'}
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            placeholder="Type your reply to the user..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleReply}
            disabled={submitting || !replyText.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            {submitting ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
