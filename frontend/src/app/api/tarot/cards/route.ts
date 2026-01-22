import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth';
import { TarotCard } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const suit = searchParams.get('suit');

    const cards = await prisma.tarotCard.findMany({
      where: suit ? { suit } : undefined,
      orderBy: [{ suit: 'asc' }, { card_number: 'asc' }],
    });

    const formatted = cards.map(card => ({
      ...card,
      id: Number(card.id),
    })) as TarotCard[];

    return createSuccessResponse({
      cards: formatted,
      total: formatted.length,
    });

  } catch (error: any) {
    console.error('Get tarot cards error:', error);
    return createErrorResponse('Failed to fetch tarot cards: ' + error.message, 500);
  }
}
