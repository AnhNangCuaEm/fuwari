import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createOrder } from '@/lib/orders'
import { updateStock, rollbackStock, CartStockItem } from '@/lib/stock'
import { CreateOrderData, CartItem } from '@/types/order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

// Disable body parser — Stripe requires the raw body for signature verification
export const config = { api: { bodyParser: false } }

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only handle successful payment events
  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent

  // Parse metadata that was embedded when creating the PaymentIntent
  let cartItems: CartItem[] = []
  let customerInfo: CreateOrderData['customerInfo'] | null = null
  let totals: CreateOrderData['totals'] | null = null
  let deliveryDate: string | null = null
  let userId: string | null = null

  try {
    cartItems = JSON.parse(paymentIntent.metadata.items || '[]')
    customerInfo = JSON.parse(paymentIntent.metadata.customerInfo || 'null')
    totals = JSON.parse(paymentIntent.metadata.totals || 'null')
    deliveryDate = paymentIntent.metadata.deliveryDate || null
    userId = paymentIntent.metadata.userId || null
  } catch {
    console.error('Failed to parse PaymentIntent metadata:', paymentIntent.metadata)
    return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
  }

  if (!customerInfo || !totals || !deliveryDate || cartItems.length === 0) {
    console.error('Missing required metadata in PaymentIntent:', paymentIntent.id)
    return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 })
  }

  // Convert to stock format
  const stockItems: CartStockItem[] = cartItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
    name: item.name,
  }))

  // Update stock atomically
  const stockResult = await updateStock(stockItems)
  if (!stockResult.isAvailable) {
    console.error('Insufficient stock for PaymentIntent:', paymentIntent.id, stockResult.unavailableItems)
    // Return 200 so Stripe doesn't retry — log for manual review
    return NextResponse.json({ error: 'Stock update failed — manual review needed' }, { status: 200 })
  }

  // Create the order
  try {
    await createOrder({
      items: cartItems,
      totals,
      customerInfo,
      stripePaymentIntentId: paymentIntent.id,
      userId,
      deliveryDate,
    })
  } catch (err) {
    console.error('Order creation failed, rolling back stock:', err)
    await rollbackStock(stockItems)
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
