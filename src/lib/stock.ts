import { query } from './db';

// Interface for stock check result
export interface StockCheckResult {
  isAvailable: boolean;
  unavailableItems: {
    id: number;
    name: string;
    requestedQuantity: number;
    availableStock: number;
  }[];
}

// Interface for cart item
export interface CartStockItem {
  id: number;
  quantity: number;
  name: string;
}

/**
 * Check stock availability for cart items (read-only, no lock).
 * Used for pre-flight UI checks only — NOT as a gate before payment.
 */
export async function checkStockAvailability(cartItems: CartStockItem[]): Promise<StockCheckResult> {
  if (cartItems.length === 0) return { isAvailable: true, unavailableItems: [] };

  const ids = cartItems.map(i => i.id);
  const rows = await query<{ id: number; quantity: number }[]>(
    `SELECT id, quantity FROM products WHERE id = ANY($1::int[])`,
    [ids]
  );

  const stockMap = new Map(rows.map(r => [r.id, r.quantity]));
  const unavailableItems: StockCheckResult['unavailableItems'] = [];

  for (const item of cartItems) {
    const available = stockMap.get(item.id) ?? 0;
    if (available < item.quantity) {
      unavailableItems.push({
        id: item.id,
        name: item.name,
        requestedQuantity: item.quantity,
        availableStock: available,
      });
    }
  }

  return { isAvailable: unavailableItems.length === 0, unavailableItems };
}

/**
 * Atomically decrement stock for each item.
 * Uses a single UPDATE per item with a WHERE quantity >= requested guard,
 * so concurrent purchases cannot oversell.
 *
 * Returns a StockCheckResult so callers know exactly which items failed.
 */
export async function updateStock(cartItems: CartStockItem[]): Promise<StockCheckResult> {
  const unavailableItems: StockCheckResult['unavailableItems'] = [];

  for (const item of cartItems) {
    const result = await query<{ id: number; quantity: number }[]>(
      `UPDATE products
       SET quantity = quantity - $1
       WHERE id = $2 AND quantity >= $1
       RETURNING id, quantity`,
      [item.quantity, item.id]
    );

    if (result.length === 0) {
      // No row updated → insufficient stock at the moment of update
      const current = await query<{ quantity: number }[]>(
        'SELECT quantity FROM products WHERE id = $1',
        [item.id]
      );
      unavailableItems.push({
        id: item.id,
        name: item.name,
        requestedQuantity: item.quantity,
        availableStock: current[0]?.quantity ?? 0,
      });
    }
  }

  // If any item failed, roll back the ones that succeeded
  if (unavailableItems.length > 0) {
    const failedIds = new Set(unavailableItems.map(i => i.id));
    const successItems = cartItems.filter(i => !failedIds.has(i.id));
    if (successItems.length > 0) {
      await rollbackStock(successItems);
    }
  }

  return { isAvailable: unavailableItems.length === 0, unavailableItems };
}

/**
 * Rollback stock if order creation fails after stock was already decremented.
 */
export async function rollbackStock(cartItems: CartStockItem[]): Promise<boolean> {
  try {
    for (const cartItem of cartItems) {
      await query(
        'UPDATE products SET quantity = quantity + $1 WHERE id = $2',
        [cartItem.quantity, cartItem.id]
      );
    }
    return true;
  } catch (error) {
    console.error('Error rolling back stock:', error);
    return false;
  }
}

