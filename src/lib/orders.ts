import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Order, CreateOrderData } from '@/types/order';

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

// Ensure orders file exists
async function ensureOrdersFile(): Promise<void> {
  try {
    await fs.access(ordersFilePath);
  } catch {
    // File doesn't exist, create it
    try {
      await fs.mkdir(path.dirname(ordersFilePath), { recursive: true });
      await fs.writeFile(ordersFilePath, JSON.stringify([], null, 2));
    } catch (error) {
      console.error('Error creating orders file:', error);
      throw error;
    }
  }
}

// Read all orders from file
export async function getOrders(): Promise<Order[]> {
  try {
    await ensureOrdersFile();
    const data = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders file:', error);
    return [];
  }
}

// Save orders to file
async function saveOrders(orders: Order[]): Promise<void> {
  try {
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error saving orders file:', error);
    throw error;
  }
}

// Create a new order
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const order: Order = {
    id: uuidv4(),
    customerId: orderData.customerInfo.email,
    customerEmail: orderData.customerInfo.email,
    items: orderData.items,
    subtotal: orderData.totals.subtotal,
    tax: orderData.totals.tax,
    shipping: orderData.totals.shipping,
    total: orderData.totals.total,
    status: 'paid',
    stripePaymentIntentId: orderData.stripePaymentIntentId,
    shippingAddress: orderData.customerInfo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);

  return order;
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(order => order.id === orderId) || null;
}

// Get orders by customer email
export async function getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
  const orders = await getOrders();
  return orders.filter(order => order.customerEmail === customerEmail);
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
  const orders = await getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) {
    return null;
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  await saveOrders(orders);
  return orders[orderIndex];
}
