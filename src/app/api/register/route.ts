import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/users';
import { RegisterData } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Validate input
    if (!body.name || !body.email || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        { error: 'すべてのフィールドを入力してください' },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'パスワードが一致しません' },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上である必要があります' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Emailが無効です' },
        { status: 400 }
      );
    }

    const user = await createUser(body);

    return NextResponse.json(
      {
        message: 'アカウントを作成しました',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'このEmailが無効です' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'アカウントを作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
