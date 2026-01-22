import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  verifyPassword,
  generateToken,
  isValidEmail,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth';
import { LoginRequest, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse('Email and password are required');
    }

    if (!isValidEmail(email)) {
      return createErrorResponse('Invalid email format');
    }

    const userWithPassword = await prisma.user.findUnique({
      where: { email },
    });

    if (!userWithPassword) {
      return createErrorResponse('Incorrect email or password');
    }

    const isPasswordValid = await verifyPassword(password, userWithPassword.password_hash);
    if (!isPasswordValid) {
      return createErrorResponse('Incorrect email or password');
    }

    const user: User = {
      id: Number(userWithPassword.id),
      username: userWithPassword.username,
      email: userWithPassword.email,
      birth_date: userWithPassword.birth_date ? userWithPassword.birth_date.toISOString().split('T')[0] : undefined,
      birth_time: userWithPassword.birth_time || undefined,
      gender: userWithPassword.gender as any,
      created_at: userWithPassword.created_at.toISOString(),
      updated_at: userWithPassword.updated_at.toISOString(),
    };

    const token = generateToken(user);

    return createSuccessResponse({
      message: 'Sign in successful',
      token,
      user,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return createErrorResponse('Server error: ' + error.message, 500);
  }
}
