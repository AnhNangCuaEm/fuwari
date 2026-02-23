import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

/**
 * POST /api/confirm-payment
 *
 * Called by the client AFTER stripe.confirmCardPayment() succeeds on the browser.
 * We verify the PaymentIntent status directly with Stripe — never trust the client.
 * The actual order creation happens in the Stripe Webhook (/api/stripe/webhook).
 *
 * This endpoint only returns the orderId so the client can redirect to the
 * success page. We look it up from the database using the paymentIntentId.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body as { paymentIntentId: string };

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    // Verify with Stripe that this PaymentIntent actually succeeded
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch {
      return NextResponse.json({ error: 'Invalid paymentIntentId' }, { status: 400 });
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 402 }
      );
    }

    // The order may already exist (webhook was fast) or still being created.
    // Poll DB for up to ~9 seconds (3 retries × 3s) to find the order by paymentIntentId.
    const { getOrderByPaymentIntentId } = await import('@/lib/orders');
    let order = await getOrderByPaymentIntentId(paymentIntentId);

    if (!order) {
      // Webhook might be slightly behind — retry up to 3 times with 3s delay each
      for (let attempt = 0; attempt < 3 && !order; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        order = await getOrderByPaymentIntentId(paymentIntentId);
      }
    }

    if (!order) {
      // Webhook hasn't fired yet — return success with a pending flag and the paymentIntentId
      // so the client can still redirect to a meaningful success page.
      return NextResponse.json({
        success: true,
        pending: true,
        paymentIntentId,
        message: 'Payment confirmed. Order is being processed.',
      });
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
    console.error('Error in confirm-payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

