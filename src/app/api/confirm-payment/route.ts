import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrderByPaymentIntentId } from '@/lib/orders';
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
 * 2. If the order already exists (idempotency), return it immediately.
 * 3. Otherwise, mark the pending order (created in create-payment-intent) as 'paid'
 *    and update stock. No order data is read from Stripe metadata.
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

    // Idempotency: if order was already marked paid (e.g. duplicate request), return it
    const existingOrder = await getOrderByPaymentIntentId(paymentIntentId);
    if (existingOrder && existingOrder.status !== 'pending') {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        order: existingOrder,
      });
    }

    // Get orderId from Stripe metadata (set in create-payment-intent)
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId in payment metadata' }, { status: 400 });
    }

    // Load the pending order from DB
    const { getOrderById, updateOrderStatus } = await import('@/lib/orders');
    const pendingOrder = existingOrder ?? await getOrderById(orderId);
    if (!pendingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update stock
    const stockItems: CartStockItem[] = pendingOrder.items.map((item: CartItem) => ({
      id: item.id,
      quantity: item.quantity,
      name: item.name,
    }));

    const stockResult = await updateStock(stockItems);
    if (!stockResult.isAvailable) {
      console.error('Insufficient stock for PaymentIntent:', paymentIntentId, stockResult.unavailableItems);
      // Payment already went through — still mark paid and flag for manual review
    }

    // Mark the order as paid
    const order = await updateOrderStatus(orderId, 'paid');
    if (!order) {
      await rollbackStock(stockItems);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
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

