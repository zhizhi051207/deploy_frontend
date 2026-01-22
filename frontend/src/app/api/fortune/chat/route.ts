import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { fortuneChat } from '@/lib/deepseek';
import {
  getCurrentUserFromRequest,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { FortuneChatRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUserFromRequest(request);
    const isTrialMode = !currentUser;

    const body: FortuneChatRequest = await request.json();
    const { question, userInfo } = body;

    if (!question || question.trim().length === 0) {
      return createErrorResponse('Please enter your question');
    }

    if (question.length > 500) {
      return createErrorResponse('Question cannot exceed 500 characters');
    }

    let finalUserInfo = userInfo;
    if (!finalUserInfo && currentUser) {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(currentUser.userId) },
        select: { birth_date: true, birth_time: true, gender: true },
      });

      if (user) {
        finalUserInfo = {
          birth_date: user.birth_date ? user.birth_date.toISOString().split('T')[0] : undefined,
          birth_time: user.birth_time || undefined,
          gender: user.gender || undefined,
        };
      }
    }

    const result = await fortuneChat(question, finalUserInfo);

    let fortuneId = null;
    if (!isTrialMode && currentUser) {
      const created = await prisma.fortuneHistory.create({
        data: {
          user_id: BigInt(currentUser.userId),
          fortune_type: 'chat',
          question,
          result,
        },
        select: { id: true },
      });
      fortuneId = Number(created.id);
    }

    return createSuccessResponse({
      result,
      fortune_id: fortuneId,
      is_trial: isTrialMode,
    });

  } catch (error: any) {
    console.error('Fortune chat error:', error);
    return createErrorResponse('Oracle service unavailable: ' + error.message, 500);
  }
}
