import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fortuneChat } from '@/lib/deepseek';
import {
  getCurrentUserFromRequest,
  createAuthResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { FortuneChatRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // 获取当前用户（试用模式下可以为空）
    const currentUser = getCurrentUserFromRequest(request);
    const isTrialMode = !currentUser;

    const body: FortuneChatRequest = await request.json();
    const { question, userInfo } = body;

    // 验证问题
    if (!question || question.trim().length === 0) {
      return createErrorResponse('请输入您的问题');
    }

    if (question.length > 500) {
      return createErrorResponse('问题长度不能超过500字');
    }

    // 获取用户信息（如果未提供）
    let finalUserInfo = userInfo;
    if (!finalUserInfo && currentUser) {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('birth_date, birth_time, gender')
        .eq('id', currentUser.userId)
        .single();

      if (!error && user) {
        finalUserInfo = {
          birth_date: user.birth_date,
          birth_time: user.birth_time,
          gender: user.gender,
        };
      }
    }

    // 调用AI进行算命
    const result = await fortuneChat(question, finalUserInfo);

    // 只有登录用户才保存到历史记录
    let fortuneId = null;
    if (!isTrialMode) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('fortune_history')
        .insert({
          user_id: currentUser.userId,
          fortune_type: 'chat',
          question,
          result,
        })
        .select('id')
        .single();

      if (insertError) {
        return createErrorResponse('保存历史记录失败: ' + insertError.message, 500);
      }
      fortuneId = inserted?.id || null;
    }

    return createSuccessResponse({
      result,
      fortune_id: fortuneId,
      is_trial: isTrialMode,
    });

  } catch (error: any) {
    console.error('Fortune chat error:', error);
    return createErrorResponse('算命服务暂时不可用: ' + error.message, 500);
  }
}
