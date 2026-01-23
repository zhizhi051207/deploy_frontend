import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { answerFortuneFollowUp } from '@/lib/deepseek';
import {
  getCurrentUserFromRequest,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);
    if (!currentUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const historyId = Number(body.history_id);
    const question = (body.question || '').toString().trim();

    if (!historyId || Number.isNaN(historyId)) {
      return createErrorResponse('Invalid history id');
    }

    if (!question) {
      return createErrorResponse('Please enter your question');
    }

    if (question.length > 500) {
      return createErrorResponse('Question cannot exceed 500 characters');
    }

    const record = await prisma.fortuneHistory.findFirst({
      where: {
        id: BigInt(historyId),
        user_id: BigInt(currentUser.userId),
      },
      select: { question: true, result: true },
    });

    if (!record) {
      return createErrorResponse('History record not found', 404);
    }

    const answer = await answerFortuneFollowUp(
      record.question || '',
      record.result,
      question
    );

    return createSuccessResponse({ answer });
  } catch (error: any) {
    console.error('History followup error:', error);
    return createErrorResponse('Oracle service unavailable: ' + error.message, 500);
  }
}
