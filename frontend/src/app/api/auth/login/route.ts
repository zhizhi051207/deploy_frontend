import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  verifyPassword,
  generateToken,
  isValidEmail,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth';
import { LoginRequest, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // 验证必填字段
    if (!email || !password) {
      return createErrorResponse('邮箱和密码为必填项');
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return createErrorResponse('邮箱格式不正确');
    }

    // 查找用户
    const { data: userWithPassword, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single();

    if (userError || !userWithPassword) {
      return createErrorResponse('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, userWithPassword.password_hash);

    if (!isPasswordValid) {
      return createErrorResponse('邮箱或密码错误');
    }

    // 构建用户对象（不包含密码）
    const user: User = {
      id: userWithPassword.id,
      username: userWithPassword.username,
      email: userWithPassword.email,
      birth_date: userWithPassword.birth_date,
      birth_time: userWithPassword.birth_time,
      gender: userWithPassword.gender,
      created_at: userWithPassword.created_at,
      updated_at: userWithPassword.updated_at,
    };

    // 生成Token
    const token = generateToken(user);

    return createSuccessResponse({
      message: '登录成功',
      token,
      user,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return createErrorResponse('服务器错误: ' + error.message, 500);
  }
}
