import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders';
import { CreateOrderData } from '@/types/order';
import { updateStock, rollbackStock, CartStockItem } from '@/lib/stock';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, cartItems, customerInfo, totals, deliveryDate }: {
      paymentIntentId: string;
      cartItems: CreateOrderData['items'];
      customerInfo: CreateOrderData['customerInfo'];
      totals: CreateOrderData['totals'];
      deliveryDate: string;
    } = body;
    
    // Get user session if available (for authenticated users)
    const session = await auth();

    // Validate required fields
    if (!paymentIntentId || !cartItems || !customerInfo || !totals || !deliveryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!cartItems.length) {
      return NextResponse.json(
        { error: 'Cart items cannot be empty' },
        { status: 400 }
      );
    }

    // Validate customer info
    if (!customerInfo.email || !customerInfo.fullName) {
      return NextResponse.json(
        { error: 'Customer email and full name are required' },
        { status: 400 }
      );
    }

    // Create order data
    const orderData: CreateOrderData = {
      items: cartItems,
      totals,
      customerInfo,
      stripePaymentIntentId: paymentIntentId,
      userId: session?.user?.id || null, // Pass user ID if logged in, null for guest
      deliveryDate: deliveryDate,
    };

    // Convert cart items to stock format
    const stockItems: CartStockItem[] = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      name: item.name
    }));

    // Update stock first
    const stockUpdated = await updateStock(stockItems);
    if (!stockUpdated) {
      return NextResponse.json(
        { error: 'Failed to update stock. Please contact support.' },
        { status: 500 }
      );
    }

    // Save order to file
    let order;
    try {
      order = await createOrder(orderData);
    } catch (orderError) {
      // If order creation fails, rollback stock
      console.error('Order creation failed, rolling back stock:', orderError);
      await rollbackStock(stockItems);
      
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      },
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
