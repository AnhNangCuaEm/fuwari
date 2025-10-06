import { v4 as uuidv4 } from 'uuid';
import { Order, CreateOrderData } from '@/types/order';
import { query, queryOne, RowDataPacket } from './db';

// Read all orders from database
export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await query<(RowDataPacket & Order)[]>(
      'SELECT * FROM orders ORDER BY createdAt DESC'
    );
    // Parse JSON fields
    return orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
    }));
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

// Create a new order
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const now = new Date();

  const order: Order = {
    id: uuidv4(),
    customerId: orderData.userId || null, // Use userId if provided, otherwise NULL for guest
    customerEmail: orderData.customerInfo.email,
    items: orderData.items,
    subtotal: orderData.totals.subtotal,
    tax: orderData.totals.tax,
    shipping: orderData.totals.shipping,
    total: orderData.totals.total,
    status: 'paid',
    stripePaymentIntentId: orderData.stripePaymentIntentId,
    shippingAddress: orderData.customerInfo,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  try {
    await query(
      `INSERT INTO orders (id, customerId, customerEmail, items, subtotal, tax, shipping, total, status, stripePaymentIntentId, shippingAddress, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        order.id,
        order.customerId,
        order.customerEmail,
        JSON.stringify(order.items),
        order.subtotal,
        order.tax,
        order.shipping,
        order.total,
        order.status,
        order.stripePaymentIntentId,
        JSON.stringify(order.shippingAddress),
      ]
    );
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const order = await queryOne<RowDataPacket & Order>(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    if (order) {
      return {
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return null;
  }
}

// Get orders by customer ID (for authenticated users)
export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  try {
    const orders = await query<(RowDataPacket & Order)[]>(
      'SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC',
      [customerId]
    );
    return orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
    }));
  } catch (error) {
    console.error('Error fetching orders by customer:', error);
    return [];
  }
}

// Get orders by customer email (for guest users or email lookup)
export async function getOrdersByEmail(customerEmail: string): Promise<Order[]> {
  try {
    const orders = await query<(RowDataPacket & Order)[]>(
      'SELECT * FROM orders WHERE customerEmail = ? ORDER BY createdAt DESC',
      [customerEmail]
    );
    return orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
    }));
  } catch (error) {
    console.error('Error fetching orders by email:', error);
    return [];
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
  try {
    await query(
      'UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?',
      [status, orderId]
    );
    return await getOrderById(orderId);
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
}
