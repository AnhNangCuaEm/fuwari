import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { getAllProducts, updateProduct, deleteProduct } from '@/lib/products'

// GET /api/admin/products — list all products
export async function GET() {
  try {
    await requireAdmin()
    const products = await getAllProducts()
    return NextResponse.json({ products, count: products.length })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error in admin products GET:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/products — update a product
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
    }

    const updated = await updateProduct(Number(id), data)

    if (!updated) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: updated, message: 'Product updated successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error in admin products PATCH:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/products — delete a product
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
    }

    const success = await deleteProduct(Number(id))

    if (!success) {
      return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error in admin products DELETE:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
