import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

interface CartRow {
  product_id: number
  quantity: number
}

/**
 * GET /api/user/cart
 * Returns the authenticated user's persisted cart items.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const rows = await query<CartRow[]>(
    'SELECT product_id, quantity FROM user_carts WHERE user_id = $1',
    [session.user.id]
  )

  return NextResponse.json({ items: rows })
}

/**
 * PUT /api/user/cart
 * Replaces the user's cart with the provided items array (full sync).
 * Body: { items: Array<{ product_id: number; quantity: number }> }
 */
export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { items } = await request.json() as { items: CartRow[] }

  if (!Array.isArray(items)) {
    return NextResponse.json({ message: 'items must be an array' }, { status: 400 })
  }

  // Replace cart atomically
  await query('DELETE FROM user_carts WHERE user_id = $1', [session.user.id])

  if (items.length > 0) {
    const values = items
      .filter((i) => i.quantity > 0)
      .map((_, idx) => `($1, $${idx * 2 + 2}, $${idx * 2 + 3}, NOW(), NOW())`)
      .join(', ')

    const params: (string | number)[] = [session.user.id]
    items
      .filter((i) => i.quantity > 0)
      .forEach((i) => params.push(i.product_id, i.quantity))

    if (params.length > 1) {
      await query(
        `INSERT INTO user_carts (user_id, product_id, quantity, created_at, updated_at)
         VALUES ${values}
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
        params
      )
    }
  }

  return NextResponse.json({ success: true })
}
