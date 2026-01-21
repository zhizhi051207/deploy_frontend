import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  getCurrentUserFromRequest,
  createAuthResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { FortuneHistory, TarotReading } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('未授权，请先登录');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'chat', 'tarot', or null for all
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let fortunes: FortuneHistory[] = [];
    let tarotReadings: TarotReading[] = [];

    // 查询AI算命历史
    if (!type || type === 'chat') {
      const { data, error } = await supabaseAdmin
        .from('fortune_history')
        .select('*')
        .eq('user_id', currentUser.userId)
        .eq('fortune_type', 'chat')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return createErrorResponse('获取算命历史失败: ' + error.message, 500);
      }

      fortunes = (data || []) as FortuneHistory[];
    }

    // 查询塔罗牌占卜历史
    if (!type || type === 'tarot') {
      const { data, error } = await supabaseAdmin
        .from('tarot_readings')
        .select('*')
        .eq('user_id', currentUser.userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return createErrorResponse('获取塔罗记录失败: ' + error.message, 500);
      }

      tarotReadings = (data || []).map(row => ({
        ...row,
        cards_drawn: typeof row.cards_drawn === 'string'
          ? JSON.parse(row.cards_drawn)
          : row.cards_drawn,
      })) as TarotReading[];
    }

    // 获取总数
    const totalFortunes = !type || type === 'chat'
      ? await supabaseAdmin
          .from('fortune_history')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUser.userId)
          .eq('fortune_type', 'chat')
      : { count: 0 } as any;

    const totalTarot = !type || type === 'tarot'
      ? await supabaseAdmin
          .from('tarot_readings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUser.userId)
      : { count: 0 } as any;

    return createSuccessResponse({
      fortunes,
      tarot_readings: tarotReadings,
      total: {
        fortunes: (totalFortunes as any).count || 0,
        tarot: (totalTarot as any).count || 0,
      },
    });

  } catch (error: any) {
    console.error('Get history error:', error);
    return createErrorResponse('获取历史记录失败: ' + error.message, 500);
  }
}

// 删除历史记录
export async function DELETE(request: NextRequest) {
  try {
    // 获取当前用户
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('未授权，请先登录');
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'fortune' or 'tarot'
    const id = searchParams.get('id');

    if (!type || !id) {
      return createErrorResponse('缺少必要参数');
    }

    if (type === 'fortune') {
      // 删除算命记录
      const { error } = await supabaseAdmin
        .from('fortune_history')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.userId);

      if (error) {
        return createErrorResponse('删除失败: ' + error.message, 500);
      }
    } else if (type === 'tarot') {
      // 删除塔罗牌记录
      const { error } = await supabaseAdmin
        .from('tarot_readings')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.userId);

      if (error) {
        return createErrorResponse('删除失败: ' + error.message, 500);
      }
    } else {
      return createErrorResponse('无效的类型参数');
    }

    return createSuccessResponse({
      message: '删除成功',
    });

  } catch (error: any) {
    console.error('Delete history error:', error);
    return createErrorResponse('删除历史记录失败: ' + error.message, 500);
  }
}
