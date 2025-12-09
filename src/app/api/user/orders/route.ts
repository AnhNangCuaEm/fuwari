import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getOrdersByCustomer } from "@/lib/orders"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get orders from PostgreSQL database by user ID
    const userOrders = await getOrdersByCustomer(user.id);

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
