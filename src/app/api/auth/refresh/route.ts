import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { findUserById } from "@/lib/users"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const user = await findUserById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        provider: user.provider
      },
      message: "User data refreshed"
    })
  } catch (error) {
    console.error("Error refreshing user data:", error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
