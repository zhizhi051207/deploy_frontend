import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getCurrentUserFromRequest,
  createAuthResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('Unauthorized. Please sign in.');
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(currentUser.userId) },
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

    if (!user) {
      return createAuthResponse('User not found');
    }

    const formattedUser: User = {
      id: Number(user.id),
      username: user.username,
      email: user.email,
      birth_date: user.birth_date ? user.birth_date.toISOString().split('T')[0] : undefined,
      birth_time: user.birth_time || undefined,
      gender: user.gender as any,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    return createSuccessResponse({ user: formattedUser });

  } catch (error: any) {
    console.error('Get current user error:', error);
    return createErrorResponse('Server error: ' + error.message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('Unauthorized. Please sign in.');
    }

    const body = await request.json();
    const { birth_date, birth_time, gender } = body;

    await prisma.user.update({
      where: { id: BigInt(currentUser.userId) },
      data: {
        birth_date: birth_date ? new Date(birth_date) : null,
        birth_time: birth_time || null,
        gender: gender || null,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: BigInt(currentUser.userId) },
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

    if (!user) {
      return createErrorResponse('Failed to fetch user profile', 500);
    }

    const formattedUser: User = {
      id: Number(user.id),
      username: user.username,
      email: user.email,
      birth_date: user.birth_date ? user.birth_date.toISOString().split('T')[0] : undefined,
      birth_time: user.birth_time || undefined,
      gender: user.gender as any,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    return createSuccessResponse({
      message: 'Profile updated successfully',
      user: formattedUser,
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    return createErrorResponse('Server error: ' + error.message, 500);
  }
}
