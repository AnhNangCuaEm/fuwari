import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem, OrderTotals, ShippingAddress } from '@/types/order';
import { auth } from '@/lib/auth';

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

    // Stripe metadata values must be strings and total size ≤ 8KB (each value ≤ 500 chars).
    // We embed all order data here so the confirm-payment route can reconstruct the order.
    // NOTE: description is intentionally omitted to keep the metadata short.
    const itemsMetadata = JSON.stringify(items.map((item: CartItem) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    })));

    const customerInfoMetadata = JSON.stringify(customerInfo);
    const totalsMetadata = JSON.stringify(totals);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'jpy',
      metadata: {
        items: itemsMetadata,
        customerInfo: customerInfoMetadata,
        totals: totalsMetadata,
        deliveryDate,
        userId: userId ?? '',
        environment: process.env.NODE_ENV,
      },
      description: `Fuwari Sweet Shop - ${items.length} items`,
    });

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
