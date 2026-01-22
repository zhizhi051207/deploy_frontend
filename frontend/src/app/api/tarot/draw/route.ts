import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { interpretTarot } from '@/lib/deepseek';
import {
  getCurrentUserFromRequest,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { TarotReadingRequest, TarotCard, DrawnCard } from '@/types';

function drawCards(allCards: TarotCard[], count: number): DrawnCard[] {
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const drawn = shuffled.slice(0, count);

  return drawn.map((card, index) => {
    const isReversed = Math.random() < 0.5;
    const meaning = isReversed ? card.reversed_meaning : card.upright_meaning;

    return {
      card,
      position: index + 1,
      isReversed,
      meaning,
    };
  });
}

function getSpreadCardCount(spreadType: string): number {
  const spreadCounts: Record<string, number> = {
    'single': 1,
    'three-card': 3,
    'celtic-cross': 10,
  };

  return spreadCounts[spreadType] || 1;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);
    const isTrialMode = !currentUser;

    const body: TarotReadingRequest = await request.json();
    const { spread_type, question } = body;

    if (!spread_type) {
      return createErrorResponse('Please select a spread type');
    }

    if (!question || question.trim().length === 0) {
      return createErrorResponse('Please enter your question');
    }

    if (question.length > 200) {
      return createErrorResponse('Question cannot exceed 200 characters');
    }

    const rawCards = await prisma.tarotCard.findMany();

    if (rawCards.length === 0) {
      return createErrorResponse('Tarot deck not initialized. Please contact support.', 500);
    }

    const allCards = rawCards.map(card => ({
      ...card,
      id: Number(card.id),
    })) as TarotCard[];

    const cardCount = getSpreadCardCount(spread_type);
    const drawnCards = drawCards(allCards as TarotCard[], cardCount);

    const cardsForAI = drawnCards.map(dc => ({
      name_cn: dc.card.name_cn,
      name_en: dc.card.name_en,
      isReversed: dc.isReversed,
      position: dc.position,
      upright_meaning: dc.card.upright_meaning,
      reversed_meaning: dc.card.reversed_meaning,
    }));

    const interpretation = await interpretTarot(cardsForAI, question, spread_type);

    const responseCards = drawnCards.map(dc => ({
      ...dc.card,
      is_reversed: dc.isReversed,
      position: dc.position,
      meaning: dc.meaning,
    }));

    let readingId = null;
    if (!isTrialMode && currentUser) {
      const created = await prisma.tarotReading.create({
        data: {
          user_id: BigInt(currentUser.userId),
          spread_type,
          cards_drawn: responseCards as any,
          interpretation,
        },
        select: { id: true },
      });
      readingId = Number(created.id);
    }

    return createSuccessResponse({
      cards: responseCards,
      interpretation,
      reading_id: readingId,
      is_trial: isTrialMode,
    });

  } catch (error: any) {
    console.error('Tarot draw error:', error);
    return createErrorResponse('Tarot service unavailable: ' + error.message, 500);
  }
}
