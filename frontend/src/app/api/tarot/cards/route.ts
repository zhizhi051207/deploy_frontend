import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth';
import { TarotCard } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const suit = searchParams.get('suit');

    let query = supabaseAdmin
      .from('tarot_cards')
      .select('*')
      .order('suit', { ascending: true })
      .order('card_number', { ascending: true });

    if (suit) {
      query = query.eq('suit', suit);
    }

    const { data: cards, error } = await query;

    if (error) {
      return createErrorResponse('获取塔罗牌数据失败: ' + error.message, 500);
    }

    return createSuccessResponse({
      cards: (cards || []) as TarotCard[],
      total: cards?.length || 0,
    });

  } catch (error: any) {
    console.error('Get tarot cards error:', error);
    return createErrorResponse('获取塔罗牌数据失败: ' + error.message, 500);
  }
}
