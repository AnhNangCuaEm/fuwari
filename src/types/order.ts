export interface CartItem {
  id: number;
  name: string;
  engName?: string;
  description: string;
  engDescription?: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string | null; // NULL for guest orders
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripePaymentIntentId?: string;
  shippingAddress: ShippingAddress;
  deliveryDate: string; // ISO date string for scheduled delivery
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: CartItem[];
  totals: OrderTotals;
  customerInfo: ShippingAddress;
  stripePaymentIntentId: string;
  userId?: string | null; // Optional user ID for authenticated users
  deliveryDate: string; // ISO date string for scheduled delivery
}
