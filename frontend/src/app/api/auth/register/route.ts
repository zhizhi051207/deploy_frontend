import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  hashPassword,
  generateToken,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/auth';
import { RegisterRequest, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { username, email, password, birth_date, birth_time, gender } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      return createErrorResponse('用户名、邮箱和密码为必填项');
    }

    // 验证用户名格式
    if (!isValidUsername(username)) {
      return createErrorResponse('用户名只能包含字母、数字和下划线，长度为3-50位');
    }

    // 验证邮箱格式
    if (!isValidEmail(email)) {
      return createErrorResponse('邮箱格式不正确');
    }

    // 验证密码强度
    if (!isValidPassword(password)) {
      return createErrorResponse('密码长度至少为6位');
    }

    // 检查用户名是否已存在
    const { data: existingUsername, error: usernameError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (usernameError) {
      return createErrorResponse('数据库错误: ' + usernameError.message, 500);
    }

    if (existingUsername && existingUsername.length > 0) {
      return createErrorResponse('用户名已被使用');
    }

    // 检查邮箱是否已存在
    const { data: existingEmail, error: emailError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (emailError) {
      return createErrorResponse('数据库错误: ' + emailError.message, 500);
    }

    if (existingEmail && existingEmail.length > 0) {
      return createErrorResponse('邮箱已被注册');
    }

    // 加密密码
    const password_hash = await hashPassword(password);

    // 插入新用户并返回
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        email,
        password_hash,
        birth_date: birth_date || null,
        birth_time: birth_time || null,
        gender: gender || null,
      })
      .select('id, username, email, birth_date, birth_time, gender, created_at, updated_at')
      .single();

    if (insertError || !newUser) {
      return createErrorResponse('创建用户失败: ' + (insertError?.message || '未知错误'), 500);
    }

    const user = newUser as User;

    // 生成Token
    const token = generateToken(user);

    return createSuccessResponse({
      message: '注册成功',
      token,
      user,
    }, 201);

  } catch (error: any) {
    console.error('Register error:', error);
    return createErrorResponse('服务器错误: ' + error.message, 500);
  }
}
