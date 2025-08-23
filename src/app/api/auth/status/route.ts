import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          isAuthenticated: false, 
          user: null,
          message: "Not authenticated" 
        },
        { status: 401 }
      )
    }

    // Return user info without sensitive data
    const userInfo = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      image: session.user.image,
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: userInfo,
      message: "Authenticated"
    })
  } catch (error) {
    console.error("Error in auth status API:", error)
    return NextResponse.json(
      { 
        isAuthenticated: false, 
        user: null,
        message: "Server error" 
      },
      { status: 500 }
    )
  }
}
