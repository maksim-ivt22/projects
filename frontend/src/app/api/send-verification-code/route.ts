import { NextResponse } from 'next/server';
import { generateCode, storeTempUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email и имя обязательны' },
        { status: 400 }
      );
    }

    const verificationCode = generateCode();
    await storeTempUser({ email, verificationCode, userData: { name } });

    console.log('Код подтверждения для', email, ':', verificationCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}