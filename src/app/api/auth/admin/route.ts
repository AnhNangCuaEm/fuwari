import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          isAdmin: false, 
          message: "Not authenticated" 
        },
        { status: 401 }
      )
    }

    const isAdmin = session.user.role === 'admin'

    return NextResponse.json({
      isAdmin,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      message: isAdmin ? "Admin access granted" : "Admin access denied"
    })
  } catch (error) {
    console.error("Error in admin check API:", error)
    return NextResponse.json(
      { 
        isAdmin: false, 
        message: "Server error" 
      },
      { status: 500 }
    )
  }
}
