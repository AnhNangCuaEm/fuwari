import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrder, getOrderByPaymentIntentId } from '@/lib/orders';
import { updateStock, rollbackStock, CartStockItem } from '@/lib/stock';
import { CartItem } from '@/types/order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

/**
 * POST /api/confirm-payment
 *
 * Called by the client AFTER stripe.confirmCardPayment() succeeds on the browser.
 * 1. Verify the PaymentIntent status directly with Stripe.
 * 2. If the order already exists (e.g. duplicate call), return it immediately.
 * 3. Otherwise, create the order from the metadata embedded in the PaymentIntent.
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

    // Idempotency: if order was already created (e.g. duplicate request), return it
    const existingOrder = await getOrderByPaymentIntentId(paymentIntentId);
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        order: existingOrder,
      });
    }

    // Parse order data from PaymentIntent metadata
    let cartItems: CartItem[] = [];
    let customerInfo = null;
    let totals = null;
    let deliveryDate: string | null = null;
    let userId: string | null = null;

    try {
      cartItems = JSON.parse(paymentIntent.metadata.items || '[]');
      customerInfo = JSON.parse(paymentIntent.metadata.customerInfo || 'null');
      totals = JSON.parse(paymentIntent.metadata.totals || 'null');
      deliveryDate = paymentIntent.metadata.deliveryDate || null;
      userId = paymentIntent.metadata.userId || null;
    } catch {
      console.error('Failed to parse PaymentIntent metadata:', paymentIntent.metadata);
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 });
    }

    if (!customerInfo || !totals || !deliveryDate || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required order data in payment metadata' }, { status: 400 });
    }

    // Update stock
    const stockItems: CartStockItem[] = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      name: item.name,
    }));

    const stockResult = await updateStock(stockItems);
    if (!stockResult.isAvailable) {
      console.error('Insufficient stock for PaymentIntent:', paymentIntentId, stockResult.unavailableItems);
      // Payment already went through, so still create the order and flag for manual review
    }

    // Create the order
    let order;
    try {
      order = await createOrder({
        items: cartItems,
        totals,
        customerInfo,
        stripePaymentIntentId: paymentIntent.id,
        userId: userId || null,
        deliveryDate,
      });
    } catch (err) {
      console.error('Order creation failed, rolling back stock:', err);
      await rollbackStock(stockItems);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    });
  } catch (error) {
    console.error('Error in confirm-payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

