import { getProductById } from './products';
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
 * Check stock availability for cart items
 */
export async function checkStockAvailability(cartItems: CartStockItem[]): Promise<StockCheckResult> {
  const unavailableItems: StockCheckResult['unavailableItems'] = [];

  for (const cartItem of cartItems) {
    const product = await getProductById(cartItem.id);
    
    if (!product) {
      unavailableItems.push({
        id: cartItem.id,
        name: cartItem.name,
        requestedQuantity: cartItem.quantity,
        availableStock: 0
      });
      continue;
    }

    if (product.quantity < cartItem.quantity) {
      unavailableItems.push({
        id: product.id,
        name: product.name,
        requestedQuantity: cartItem.quantity,
        availableStock: product.quantity
      });
    }
  }

  return {
    isAvailable: unavailableItems.length === 0,
    unavailableItems
  };
}

/**
 * Update stock after order is confirmed
 */
export async function updateStock(cartItems: CartStockItem[]): Promise<boolean> {
  try {
    // Update quantity for each product in database
    for (const cartItem of cartItems) {
      await query(
        'UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
        [cartItem.quantity, cartItem.id]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
}

/**
 * Rollback stock if order creation fails
 */
export async function rollbackStock(cartItems: CartStockItem[]): Promise<boolean> {
  try {
    // Restore quantity for each product in database
    for (const cartItem of cartItems) {
      await query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [cartItem.quantity, cartItem.id]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error rolling back stock:', error);
    return false;
  }
}
