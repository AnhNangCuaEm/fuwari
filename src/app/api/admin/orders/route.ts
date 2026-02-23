import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { getOrders, updateOrderStatus } from '@/lib/orders'
import { Order } from '@/types/order'

// GET /api/admin/orders — list all orders
export async function GET() {
  try {
    await requireAdmin()
    const orders = await getOrders()
    return NextResponse.json({ orders, count: orders.length })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error in admin orders GET:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/admin/orders — update order status
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, status } = body

    if (!id) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 })
    }

    const validStatuses: Order['status'][] = [
      'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 })
    }

    const updated = await updateOrderStatus(id, status)
    if (!updated) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order: updated, message: 'Order status updated successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    console.error('Error in admin orders PATCH:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
