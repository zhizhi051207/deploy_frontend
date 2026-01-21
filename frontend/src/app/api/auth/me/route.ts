import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  getCurrentUserFromRequest,
  createAuthResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/auth';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('未授权，请先登录');
    }

    // 从数据库获取用户详细信息
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, birth_date, birth_time, gender, created_at, updated_at')
      .eq('id', currentUser.userId)
      .single();

    if (error || !user) {
      return createAuthResponse('用户不存在');
    }

    return createSuccessResponse({
      user: user as User,
    });

  } catch (error: any) {
    console.error('Get current user error:', error);
    return createErrorResponse('服务器错误: ' + error.message, 500);
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    // 获取当前用户
    const currentUser = getCurrentUserFromRequest(request);

    if (!currentUser) {
      return createAuthResponse('未授权，请先登录');
    }

    const body = await request.json();
    const { birth_date, birth_time, gender } = body;

    // 更新用户信息
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        birth_date: birth_date || null,
        birth_time: birth_time || null,
        gender: gender || null,
      })
      .eq('id', currentUser.userId);

    if (updateError) {
      return createErrorResponse('更新失败: ' + updateError.message, 500);
    }

    // 获取更新后的用户信息
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, username, email, birth_date, birth_time, gender, created_at, updated_at')
      .eq('id', currentUser.userId)
      .single();

    if (fetchError || !user) {
      return createErrorResponse('获取用户信息失败', 500);
    }

    return createSuccessResponse({
      message: '用户信息更新成功',
      user: user as User,
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    return createErrorResponse('服务器错误: ' + error.message, 500);
  }
}
