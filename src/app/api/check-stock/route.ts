import { NextRequest, NextResponse } from 'next/server';
import { checkStockAvailability, CartStockItem } from '@/lib/stock';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems }: { cartItems: CartStockItem[] } = body;

    // Validate input
    if (!cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: 'Invalid cart items' },
        { status: 400 }
      );
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability
    const stockResult = await checkStockAvailability(cartItems);

    return NextResponse.json({
      success: true,
      isAvailable: stockResult.isAvailable,
      unavailableItems: stockResult.unavailableItems
    });

  } catch (error) {
    console.error('Error checking stock:', error);
    
    return NextResponse.json(
      { error: 'Failed to check stock availability' },
      { status: 500 }
    );
  }
}
