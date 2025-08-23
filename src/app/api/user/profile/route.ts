import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Return user profile without sensitive data
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      user: userProfile,
      message: "Profile retrieved successfully"
    })
  } catch (error) {
    console.error("Error in user profile API:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    // Here you would update the user in your database
    // For now, we'll just return a success message
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        ...user,
        name: name || user.name,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
