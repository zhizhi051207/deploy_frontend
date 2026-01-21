// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  birth_date?: string;
  birth_time?: string;
  gender?: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}

// 注册请求
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  birth_date?: string;
  birth_time?: string;
  gender?: 'male' | 'female' | 'other';
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 认证响应
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// 塔罗牌类型
export interface TarotCard {
  id: number;
  name_cn: string;
  name_en: string;
  card_number: number;
  suit: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  upright_meaning: string;
  reversed_meaning: string;
  image_url?: string;
  description: string;
}

// 抽取的塔罗牌（包含正逆位）
export interface DrawnCard {
  card: TarotCard;
  position: number;
  isReversed: boolean;
  meaning: string;
}

// 塔罗牌阵类型
export type SpreadType = 'single' | 'three-card' | 'celtic-cross';

// 塔罗牌占卜请求
export interface TarotReadingRequest {
  spread_type: SpreadType;
  question: string;
}

// 塔罗牌占卜响应
export interface TarotReadingResponse {
  success: boolean;
  cards: DrawnCard[];
  interpretation: string;
  reading_id?: number;
}

// 算命类型
export type FortuneType = 'chat' | 'tarot';

// AI算命请求
export interface FortuneChatRequest {
  question: string;
  userInfo?: {
    birth_date?: string;
    birth_time?: string;
    gender?: string;
  };
}

// AI算命响应
export interface FortuneChatResponse {
  success: boolean;
  result: string;
  fortune_id?: number;
}

// 算命历史记录
export interface FortuneHistory {
  id: number;
  user_id: number;
  fortune_type: FortuneType;
  question?: string;
  result: string;
  created_at: string;
}

// 塔罗牌占卜历史
export interface TarotReading {
  id: number;
  user_id: number;
  spread_type: string;
  cards_drawn: DrawnCard[];
  interpretation: string;
  created_at: string;
}

// 历史记录响应
export interface HistoryResponse {
  success: boolean;
  fortunes?: FortuneHistory[];
  tarot_readings?: TarotReading[];
  total?: number;
}

// API错误响应
export interface ApiError {
  success: false;
  error: string;
  message: string;
}

// API成功响应基础类型
export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// 通用API响应
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;
