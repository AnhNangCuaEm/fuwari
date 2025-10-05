import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { findUserById, updateUserProfile } from "@/lib/users"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get full user profile from database
    const fullUser = await findUserById(user.id);

    if (!fullUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Return user profile
    const userProfile = {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      image: fullUser.image || '',
      phone: fullUser.phone || '',
      address: fullUser.address || '',
      postalCode: fullUser.postalCode || '',
      city: fullUser.city || '',
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
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
    const { name, phone, address, postalCode, city, image } = body

    // Update user profile in database
    const updatedUser = await updateUserProfile(user.id, {
      name,
      phone,
      address,
      postalCode,
      city,
      image
    });

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        postalCode: updatedUser.postalCode || '',
        city: updatedUser.city || '',
        image: updatedUser.image || '',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
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
