import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { interpretTarot } from '@/lib/deepseek';
import {
  getCurrentUserFromRequest,
  createAuthResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { TarotReadingRequest, TarotCard, DrawnCard } from '@/types';

// 抽取塔罗牌
function drawCards(allCards: TarotCard[], count: number): DrawnCard[] {
  // 随机打乱卡牌
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);

  // 抽取指定数量的卡牌
  const drawn = shuffled.slice(0, count);

  // 为每张牌确定正逆位和位置
  return drawn.map((card, index) => {
    const isReversed = Math.random() < 0.5; // 50%概率逆位
    const meaning = isReversed ? card.reversed_meaning : card.upright_meaning;

    return {
      card,
      position: index + 1,
      isReversed,
      meaning,
    };
  });
}

// 获取牌阵卡牌数量
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
    // 获取当前用户（试用模式下可以为空）
    const currentUser = getCurrentUserFromRequest(request);
    const isTrialMode = !currentUser;

    const body: TarotReadingRequest = await request.json();
    const { spread_type, question } = body;

    // 验证参数
    if (!spread_type) {
      return createErrorResponse('请选择牌阵类型');
    }

    if (!question || question.trim().length === 0) {
      return createErrorResponse('请输入您的问题');
    }

    if (question.length > 200) {
      return createErrorResponse('问题长度不能超过200字');
    }

    // 获取所有塔罗牌
    const { data: allCards, error: cardsError } = await supabaseAdmin
      .from('tarot_cards')
      .select('*');

    if (cardsError) {
      return createErrorResponse('获取塔罗牌数据失败: ' + cardsError.message, 500);
    }

    if (!allCards || allCards.length === 0) {
      return createErrorResponse('塔罗牌数据未初始化，请联系管理员', 500);
    }

    // 确定需要抽取的卡牌数量
    const cardCount = getSpreadCardCount(spread_type);

    // 抽取卡牌
    const drawnCards = drawCards(allCards as TarotCard[], cardCount);

    // 准备AI解读数据
    const cardsForAI = drawnCards.map(dc => ({
      name_cn: dc.card.name_cn,
      name_en: dc.card.name_en,
      isReversed: dc.isReversed,
      position: dc.position,
      upright_meaning: dc.card.upright_meaning,
      reversed_meaning: dc.card.reversed_meaning,
    }));

    // 调用AI进行解读
    const interpretation = await interpretTarot(cardsForAI, question, spread_type);

    // 只有登录用户才保存占卜记录
    let readingId = null;
    if (!isTrialMode) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('tarot_readings')
        .insert({
          user_id: currentUser.userId,
          spread_type,
          cards_drawn: drawnCards,
          interpretation,
        })
        .select('id')
        .single();

      if (insertError) {
        return createErrorResponse('保存占卜记录失败: ' + insertError.message, 500);
      }
      readingId = inserted?.id || null;
    }

    return createSuccessResponse({
      cards: drawnCards,
      interpretation,
      reading_id: readingId,
      is_trial: isTrialMode,
    });

  } catch (error: any) {
    console.error('Tarot draw error:', error);
    return createErrorResponse('塔罗占卜服务暂时不可用: ' + error.message, 500);
  }
}
