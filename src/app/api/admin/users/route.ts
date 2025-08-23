import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { getUsers } from "@/lib/users"

export async function GET() {
  try {
    // Require admin access
    await requireAdmin()
    
    const users = await getUsers()
    
    // Return users without sensitive data
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return NextResponse.json({
      users: safeUsers,
      count: safeUsers.length,
      message: "Users retrieved successfully"
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      )
    }
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    console.error("Error in admin users API:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
