import { NextResponse } from 'next/server';
import { verifyCode, deleteTempUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email и код обязательны' },
        { status: 400 }
      );
    }

    const isValid = verifyCode(email, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный код подтверждения' },
        { status: 400 }
      );
    }

    deleteTempUser(email);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}