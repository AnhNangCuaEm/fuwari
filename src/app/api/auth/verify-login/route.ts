import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      const user = await verifyPassword(email, password);
      
      if (user) {
        return NextResponse.json({ 
          success: true, 
          message: 'Login credentials valid' 
        });
      } else {
        return NextResponse.json(
          { error: 'EMAIL_OR_PASSWORD_INVALID' },
          { status: 401 }
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'ACCOUNT_BANNED') {
        return NextResponse.json(
          { error: 'ACCOUNT_BANNED' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'LOGIN_ERROR' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login verify error:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
