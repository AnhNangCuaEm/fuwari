import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { getUsers, updateUserStatus, updateUserRole } from "@/lib/users"

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
      status: user.status,
      provider: user.provider,
      image: user.image,
      phone: user.phone,
      address: user.address,
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

export async function PATCH(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin()
    
    const body = await request.json()
    const { userId, action, value } = body

    if (!userId || !action) {
      return NextResponse.json(
        { message: "User ID and action are required" },
        { status: 400 }
      )
    }

    let updatedUser = null

    if (action === 'updateStatus' && (value === 'active' || value === 'banned')) {
      updatedUser = await updateUserStatus(userId, value)
    } else if (action === 'updateRole' && (value === 'user' || value === 'admin')) {
      updatedUser = await updateUserRole(userId, value)
    } else {
      return NextResponse.json(
        { message: "Invalid action or value" },
        { status: 400 }
      )
    }

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Return updated user without sensitive data
    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      provider: updatedUser.provider,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }

    return NextResponse.json({
      user: safeUser,
      message: `User ${action} updated successfully`
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

    console.error("Error in admin users PATCH API:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
