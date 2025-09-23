import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { getProductById } from './products';

const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

// Interface cho stock check result
export interface StockCheckResult {
  isAvailable: boolean;
  unavailableItems: {
    id: number;
    name: string;
    requestedQuantity: number;
    availableStock: number;
  }[];
}

// Interface cho cart item
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
    const product = getProductById(cartItem.id);
    
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
    // Read current products.json file
    const productsData: Product[] = JSON.parse(
      fs.readFileSync(PRODUCTS_FILE_PATH, 'utf8')
    );

    // Update quantity for each product
    const updatedProducts = productsData.map(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      
      if (cartItem) {
        // Subtract sold quantity
        const newQuantity = Math.max(0, product.quantity - cartItem.quantity);
        return {
          ...product,
          quantity: newQuantity
        };
      }
      
      return product;
    });

    // Write back to file
    fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(updatedProducts, null, 2));
    
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
    // Read current products.json file
    const productsData: Product[] = JSON.parse(
      fs.readFileSync(PRODUCTS_FILE_PATH, 'utf8')
    );

    // Restore quantity
    const updatedProducts = productsData.map(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      
      if (cartItem) {
        return {
          ...product,
          quantity: product.quantity + cartItem.quantity
        };
      }
      
      return product;
    });

    // Write back to file
    fs.writeFileSync(PRODUCTS_FILE_PATH, JSON.stringify(updatedProducts, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error rolling back stock:', error);
    return false;
  }
}
