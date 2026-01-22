import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  hashPassword,
  generateToken,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth';
import { RegisterRequest, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, email, password, birth_date, birth_time, gender } = body;

    if (!username || !email || !password) {
      return createErrorResponse('Username, email, and password are required');
    }

    if (!isValidUsername(username)) {
      return createErrorResponse('Username may contain letters, numbers, and underscores (3-50 chars)');
    }

    if (!isValidEmail(email)) {
      return createErrorResponse('Invalid email format');
    }

    if (!isValidPassword(password)) {
      return createErrorResponse('Password must be at least 6 characters');
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (existingUsername) {
      return createErrorResponse('Username is already taken');
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingEmail) {
      return createErrorResponse('Email is already registered');
    }

    const password_hash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        birth_date: birth_date ? new Date(birth_date) : null,
        birth_time: birth_time || null,
        gender: gender || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        birth_date: true,
        birth_time: true,
        gender: true,
        created_at: true,
        updated_at: true,
      },
    });

    const user: User = {
      id: Number(newUser.id),
      username: newUser.username,
      email: newUser.email,
      birth_date: newUser.birth_date ? newUser.birth_date.toISOString().split('T')[0] : undefined,
      birth_time: newUser.birth_time || undefined,
      gender: newUser.gender as any,
      created_at: newUser.created_at.toISOString(),
      updated_at: newUser.updated_at.toISOString(),
    };

    const token = generateToken(user);

    return createSuccessResponse({
      message: 'Account created successfully',
      token,
      user,
    }, 201);

  } catch (error: any) {
    console.error('Register error:', error);
    return createErrorResponse('Server error: ' + error.message, 500);
  }
}
