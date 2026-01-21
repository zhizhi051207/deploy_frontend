import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token有效期7天
const SALT_ROUNDS = 10;

// 加密密码
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// 验证密码
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// 生成JWT Token
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证JWT Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 从请求中提取Token
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 从Authorization header中提取
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 从cookies中提取
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

// 从请求中获取当前用户
export function getCurrentUserFromRequest(request: NextRequest): any {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证密码强度（至少6位）
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// 验证用户名（3-50位，只允许字母数字下划线）
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
}

// 创建认证中间件响应
export function createAuthResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// 创建成功响应
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// 创建错误响应
export function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
