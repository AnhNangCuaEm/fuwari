'use client'

import { useState, useEffect, useMemo } from 'react'
import { Order } from '@/types/order'
import OrderDetailModal from '@/components/admin/OrderDetailModal'

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

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as Order['status'][]

function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders')
      setOrders(data.orders)
    } catch {
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [orders, search, statusFilter])

  const openDetail = (order: Order) => {
    setSelected(order)
    setIsModalOpen(true)
  }

  const handleStatusUpdated = (updated: Order) => {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)))
  }

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-red-500 mb-4 text-sm">{error}</p>
        <button onClick={fetchOrders}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 px-6 py-5 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} / {orders.length} order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ID, email, name…"
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as Order['status'] | 'all')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All statuses</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>

            {/* Refresh */}
            <button onClick={fetchOrders} title="Refresh"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order ID', 'Customer', 'Items', 'Total', 'Delivery Date', 'Status', 'Actions'].map(h => (
                  <th key={h}
                    className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Order ID */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-mono font-medium text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                        {order.shippingAddress?.fullName ?? '—'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[160px]">
                        {order.customerEmail}
                      </p>
                    </div>
                  </td>

                  {/* Items count */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ¥{(order.total ?? 0).toLocaleString()}
                  </td>

                  {/* Delivery Date */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.deliveryDate
                      ? new Date(order.deliveryDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openDetail(order)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search || statusFilter !== 'all' ? 'No orders match your filters.' : 'No orders found.'}
          </div>
        )}
      </div>

      {/* Detail / status modal */}
      <OrderDetailModal
        order={selected}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelected(null) }}
        onStatusUpdated={handleStatusUpdated}
      />
    </>
  )
}
