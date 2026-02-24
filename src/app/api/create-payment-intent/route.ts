import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem, OrderTotals, ShippingAddress } from '@/types/order';
import { auth } from '@/lib/auth';
import { createOrder } from '@/lib/orders';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items, customerInfo, totals, deliveryDate }: {
      amount: number;
      items: CartItem[];
      customerInfo: ShippingAddress;
      totals: OrderTotals;
      deliveryDate: string;
    } = body;

    // Validate required fields
    if (!amount || !items || !customerInfo || !totals || !deliveryDate) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, items, customerInfo, totals, deliveryDate' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get session to embed userId in metadata (optional)
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Create the order in DB with status 'pending' BEFORE charging.
    // This avoids stuffing order data into Stripe metadata (500-char limit per field).
    const order = await createOrder({
      items,
      totals,
      customerInfo,
      stripePaymentIntentId: '', // will be updated below
      userId,
      deliveryDate,
    });

    // Create payment intent — only store the orderId in metadata (always short)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'jpy',
      metadata: {
        orderId: order.id,
        userId: userId ?? '',
        environment: process.env.NODE_ENV,
      },
      description: `Fuwari Sweet Shop - ${items.length} items`,
    });

    // Patch the order with the real paymentIntentId now that we have it
    await import('@/lib/db').then(({ query }) =>
      query(
        'UPDATE orders SET "stripePaymentIntentId" = $1, "updatedAt" = NOW() WHERE id = $2',
        [paymentIntent.id, order.id]
      )
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
