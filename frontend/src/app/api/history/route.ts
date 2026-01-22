import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getCurrentUserFromRequest,
  createAuthResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { FortuneHistory, TarotReading } from '@/types';

function formatFortune(row: any): FortuneHistory {
  return {
    ...row,
    id: Number(row.id),
    user_id: Number(row.user_id),
  } as FortuneHistory;
}

function formatTarot(row: any): TarotReading {
  return {
    ...row,
    id: Number(row.id),
    user_id: Number(row.user_id),
    cards_drawn: typeof row.cards_drawn === 'string' ? JSON.parse(row.cards_drawn) : row.cards_drawn,
  } as TarotReading;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('Unauthorized. Please sign in.');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let fortunes: FortuneHistory[] = [];
    let tarotReadings: TarotReading[] = [];

    if (!type || type === 'chat') {
      const data = await prisma.fortuneHistory.findMany({
        where: { user_id: BigInt(currentUser.userId), fortune_type: 'chat' },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      });
      fortunes = data.map(formatFortune);
    }

    if (!type || type === 'tarot') {
      const data = await prisma.tarotReading.findMany({
        where: { user_id: BigInt(currentUser.userId) },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      });
      tarotReadings = data.map(formatTarot);
    }

    const totalFortunes = !type || type === 'chat'
      ? await prisma.fortuneHistory.count({
          where: { user_id: BigInt(currentUser.userId), fortune_type: 'chat' },
        })
      : 0;

    const totalTarot = !type || type === 'tarot'
      ? await prisma.tarotReading.count({
          where: { user_id: BigInt(currentUser.userId) },
        })
      : 0;

    return createSuccessResponse({
      fortunes,
      tarot_readings: tarotReadings,
      total: {
        fortunes: totalFortunes,
        tarot: totalTarot,
      },
    });

  } catch (error: any) {
    console.error('Get history error:', error);
    return createErrorResponse('Failed to fetch history: ' + error.message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('Unauthorized. Please sign in.');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return createErrorResponse('Missing required parameters');
    }

    if (type === 'fortune') {
      await prisma.fortuneHistory.deleteMany({
        where: { id: BigInt(id), user_id: BigInt(currentUser.userId) },
      });
    } else if (type === 'tarot') {
      await prisma.tarotReading.deleteMany({
        where: { id: BigInt(id), user_id: BigInt(currentUser.userId) },
      });
    } else {
      return createErrorResponse('Invalid type parameter');
    }

    return createSuccessResponse({ message: 'Deleted successfully' });

  } catch (error: any) {
    console.error('Delete history error:', error);
    return createErrorResponse('Failed to delete history: ' + error.message, 500);
  }
}
