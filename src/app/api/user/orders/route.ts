import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import fs from 'fs/promises'
import path from 'path'

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  items: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  stripePaymentIntentId: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

async function readOrdersFromFile(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders file:', error);
    return [];
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Read all orders and filter by user email
    const allOrders = await readOrdersFromFile();
    const userOrders = allOrders
      .filter(order => order.customerEmail === user.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first

    return NextResponse.json({
      orders: userOrders,
      message: "Orders retrieved successfully"
    })
  } catch (error) {
    console.error("Error in user orders API:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
