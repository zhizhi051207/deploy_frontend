// User type
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

// Register request
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  birth_date?: string;
  birth_time?: string;
  gender?: 'male' | 'female' | 'other';
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Tarot card type
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

// Drawn tarot card (with orientation)
export interface DrawnCard {
  card: TarotCard;
  position: number;
  isReversed: boolean;
  meaning: string;
}

// Tarot spread type
export type SpreadType = 'single' | 'three-card' | 'celtic-cross';

// Tarot reading request
export interface TarotReadingRequest {
  spread_type: SpreadType;
  question: string;
}

// Tarot reading response
export interface TarotReadingResponse {
  success: boolean;
  cards: DrawnCard[];
  interpretation: string;
  reading_id?: number;
}

// Fortune type
export type FortuneType = 'chat' | 'tarot';

// Oracle chat request
export interface FortuneChatRequest {
  question: string;
  userInfo?: {
    birth_date?: string;
    birth_time?: string;
    gender?: string;
  };
}

// Oracle chat response
export interface FortuneChatResponse {
  success: boolean;
  result: string;
  fortune_id?: number;
}

// Fortune history
export interface FortuneHistory {
  id: number;
  user_id: number;
  fortune_type: FortuneType;
  question?: string;
  result: string;
  created_at: string;
}

// Tarot reading history
export interface TarotReading {
  id: number;
  user_id: number;
  spread_type: string;
  cards_drawn: DrawnCard[];
  interpretation: string;
  created_at: string;
}

// History response
export interface HistoryResponse {
  success: boolean;
  fortunes?: FortuneHistory[];
  tarot_readings?: TarotReading[];
  total?: number;
}

// API error response
export interface ApiError {
  success: false;
  error: string;
  message: string;
}

// API success response base
export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// Generic API response
export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;
