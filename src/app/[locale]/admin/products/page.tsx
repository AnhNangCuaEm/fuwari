'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import ProductEditModal from '@/components/admin/ProductEditModal'

const CATEGORY_COLORS: Record<string, string> = {
  cakes: 'bg-pink-100 text-pink-700',
  cookies: 'bg-amber-100 text-amber-700',
  macarons: 'bg-purple-100 text-purple-700',
  original: 'bg-teal-100 text-teal-700',
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {category}
    </span>
  )
}

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0)
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Out of stock</span>
  if (quantity <= 10)
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Low ({quantity})</span>
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{quantity}</span>
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products')
      setProducts(data.products)
    } catch {
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).sort()
    return ['all', ...cats]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.engName.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      return matchCat && matchSearch
    })
  }, [products, search, categoryFilter])

  const openEdit = (product: Product) => {
    setSelected(product)
    setIsModalOpen(true)
  }

  const handleSaved = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
  }

  const handleDeleted = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id))
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
        <button onClick={fetchProducts}
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
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} / {products.length} product{products.length !== 1 ? 's' : ''}
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
                placeholder="Search name or ID…"
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
              ))}
            </select>

            {/* Refresh */}
            <button onClick={fetchProducts} title="Refresh"
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
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h}
                    className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                        <Image src={product.image} alt={product.engName} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.engName}</p>
                        <p className="text-xs text-gray-500 truncate">{product.name} · #{product.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <CategoryBadge category={product.category} />
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ¥{product.price.toLocaleString()}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <StockBadge quantity={product.quantity} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
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
            {search || categoryFilter !== 'all' ? 'No products match your filters.' : 'No products found.'}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <ProductEditModal
        product={selected}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelected(null) }}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}