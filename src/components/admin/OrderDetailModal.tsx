'use client'

import { useState } from 'react'
import Image from 'next/image'
import AdminModal from '@/components/admin/AdminModal'
import { Order } from '@/types/order'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdated: (updated: Order) => void
}

const ALL_STATUSES: Order['status'][] = [
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled',
]

const STATUS_CONFIG: Record<
  Order['status'],
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
  paid:       { label: 'Paid',       bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400'   },
  processing: { label: 'Processing', bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  shipped:    { label: 'Shipped',    bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-400' },
  delivered:  { label: 'Delivered',  bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-400'},
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400'    },
}

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
}: OrderDetailModalProps) {
  const [newStatus, setNewStatus] = useState<Order['status'] | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* reset dropdown when order changes */
  const handleOpen = () => {
    setNewStatus('')
    setError(null)
  }

  if (!order) return null

  const handleSaveStatus = async () => {
    if (!newStatus || newStatus === order.status) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update status')
      onStatusUpdated(data.order)
      setNewStatus('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const addr = order.shippingAddress
  const subtotal = order.subtotal ?? 0
  const tax      = order.tax      ?? 0
  const shipping = order.shipping ?? 0
  const total    = order.total    ?? 0

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={() => { handleOpen(); onClose() }}
      title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
      subtitle={new Date(order.createdAt).toLocaleString('ja-JP')}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          {error && <p className="text-xs text-red-500 flex-1">{error}</p>}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => { handleOpen(); onClose() }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveStatus}
              disabled={!newStatus || newStatus === order.status || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save Status'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Status row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Change Status</p>
            <select
              value={newStatus}
              onChange={e => { setNewStatus(e.target.value as Order['status']); setError(null) }}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">— select new status —</option>
              {ALL_STATUSES.filter(s => s !== order.status).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Customer & Delivery ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</p>
            <p className="text-sm font-medium text-gray-900">{addr.fullName}</p>
            <p className="text-sm text-gray-600">{order.customerEmail}</p>
            {addr.phone && <p className="text-sm text-gray-600">{addr.phone}</p>}
          </div>
          <div className="p-4 border border-gray-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</p>
            <p className="text-sm text-gray-800">{addr.address}</p>
            <p className="text-sm text-gray-800">{addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''}</p>
            <p className="text-sm text-gray-800">{addr.country}</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Date</p>
            <p className="text-sm font-medium text-gray-900">
              {order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </p>
          </div>
          {order.stripePaymentIntentId && (
            <div className="p-4 border border-gray-100 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Intent</p>
              <p className="text-xs font-mono text-gray-700 break-all">{order.stripePaymentIntentId}</p>
            </div>
          )}
        </div>

        {/* ── Items ── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                  <Image src={item.image} alt={item.engName ?? item.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.engName ?? item.name}</p>
                  <p className="text-xs text-gray-500">{item.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">¥{(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">¥{item.price.toLocaleString()} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals ── */}
        <div className="border-t border-gray-100 pt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `¥${shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2">
            <span>Total</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </AdminModal>
  )
}
