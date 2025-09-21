import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders';
import { CreateOrderData } from '@/types/order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, cartItems, customerInfo, totals }: {
      paymentIntentId: string;
      cartItems: CreateOrderData['items'];
      customerInfo: CreateOrderData['customerInfo'];
      totals: CreateOrderData['totals'];
    } = body;

    // Validate required fields
    if (!paymentIntentId || !cartItems || !customerInfo || !totals) {
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
    };

    // Save order to file
    const order = await createOrder(orderData);

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
