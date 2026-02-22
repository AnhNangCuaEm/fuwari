'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import AdminModal from '@/components/admin/AdminModal'
import { Product } from '@/types/product'

interface ProductEditModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSaved: (updated: Product) => void
  onDeleted: (id: number) => void
}

const CATEGORIES = ['cakes', 'cookies', 'macarons', 'original']

export default function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
}: ProductEditModalProps) {
  const [form, setForm] = useState<Partial<Product>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* populate form when product changes */
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        engName: product.engName,
        description: product.description,
        engDescription: product.engDescription,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        ingredients: product.ingredients,
        engIngredients: product.engIngredients,
        allergens: product.allergens,
        engAllergens: product.engAllergens,
        image: product.image,
        modelPath: product.modelPath,
      })
      setError(null)
      setConfirmDelete(false)
    }
  }, [product])

  if (!product) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }))
  }

  /* handle comma-separated array fields */
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: 'ingredients' | 'engIngredients' | 'allergens' | 'engAllergens'
  ) => {
    const items = e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
    setForm(prev => ({ ...prev, [field]: items }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update product')
      onSaved(data.product)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete product')
      onDeleted(product.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const footer = (
    <>
      {/* Delete button — left side */}
      <button
        onClick={handleDelete}
        disabled={deleting || saving}
        className={`mr-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          confirmDelete
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-red-50 text-red-600 hover:bg-red-100'
        }`}
      >
        {deleting ? 'Deleting…' : confirmDelete ? 'Confirm delete?' : 'Delete'}
      </button>

      {confirmDelete && (
        <button
          onClick={() => setConfirmDelete(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      )}

      {!confirmDelete && (
        <>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      )}
    </>
  )

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Product #${product.id}`}
      subtitle={product.engName}
      maxWidth="max-w-3xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Error banner */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Image preview */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
            <Image
              src={product.image}
              alt={product.engName}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Product ID</p>
            <p className="text-sm font-semibold text-gray-900">#{product.id}</p>
          </div>
        </div>

        {/* ── Names ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Names</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Japanese Name">
              <input name="name" value={form.name ?? ''} onChange={handleChange}
                className={inputCls} placeholder="例：カップケーキ" />
            </Field>
            <Field label="English Name">
              <input name="engName" value={form.engName ?? ''} onChange={handleChange}
                className={inputCls} placeholder="e.g. Cupcake" />
            </Field>
          </div>
        </section>

        {/* ── Category / Price / Quantity ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Details</h3>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Category">
              <select name="category" value={form.category ?? ''} onChange={handleChange}
                className={inputCls}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (¥)">
              <input name="price" type="number" min={0} value={form.price ?? 0} onChange={handleChange}
                className={inputCls} />
            </Field>
            <Field label="Stock Quantity">
              <input name="quantity" type="number" min={0} value={form.quantity ?? 0} onChange={handleChange}
                className={inputCls} />
            </Field>
          </div>
        </section>

        {/* ── Descriptions ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Descriptions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Japanese Description">
              <textarea name="description" value={form.description ?? ''} onChange={handleChange}
                rows={3} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="English Description">
              <textarea name="engDescription" value={form.engDescription ?? ''} onChange={handleChange}
                rows={3} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </section>

        {/* ── Ingredients ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Ingredients <span className="text-gray-400 font-normal normal-case">(one per line)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Japanese Ingredients">
              <textarea
                value={(form.ingredients ?? []).join('\n')}
                onChange={e => handleArrayChange(e, 'ingredients')}
                rows={4} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="English Ingredients">
              <textarea
                value={(form.engIngredients ?? []).join('\n')}
                onChange={e => handleArrayChange(e, 'engIngredients')}
                rows={4} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </section>

        {/* ── Allergens ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Allergens <span className="text-gray-400 font-normal normal-case">(one per line)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Japanese Allergens">
              <textarea
                value={(form.allergens ?? []).join('\n')}
                onChange={e => handleArrayChange(e, 'allergens')}
                rows={3} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="English Allergens">
              <textarea
                value={(form.engAllergens ?? []).join('\n')}
                onChange={e => handleArrayChange(e, 'engAllergens')}
                rows={3} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </section>

        {/* ── Paths ── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Asset Paths</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Image Path">
              <input name="image" value={form.image ?? ''} onChange={handleChange}
                className={inputCls} placeholder="/2dimage/cupcake.jpg" />
            </Field>
            <Field label="3D Model Path">
              <input name="modelPath" value={form.modelPath ?? ''} onChange={handleChange}
                className={inputCls} placeholder="/3dmodels/cupcake/scene.gltf" />
            </Field>
          </div>
        </section>
      </div>
    </AdminModal>
  )
}

/* ── Helpers ── */
const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
