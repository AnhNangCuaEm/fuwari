import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/types/order';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items, customerInfo } = body;

    // Validate required fields
    if (!amount || !items || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, items, customerInfo' },
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'jpy',
      metadata: {
        items: JSON.stringify(items.map((item: CartItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))),
        customerEmail: customerInfo.email,
        totalItems: items.length.toString(),
        environment: 'development'
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
