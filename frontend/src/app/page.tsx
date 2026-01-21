'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            神秘AI算命
          </div>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                >
                  控制台
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                    router.push('/');
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-mystic-gradient text-white transition hover:opacity-90"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 fade-in">
          <h1 className="text-6xl font-bold text-white mb-6 animate-float">
            探索命运的奥秘
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            融合传统命理学与现代AI技术，为您提供专业的算命和占卜服务
          </p>
          {!isLoggedIn && (
            <Link
              href="/register"
              className="inline-block px-8 py-4 rounded-lg bg-mystic-gradient text-white text-lg font-semibold hover:opacity-90 transition mystic-glow"
            >
              立即开始占卜
            </Link>
          )}
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI对话算命 */}
          <div className="card-hover bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              AI造梦解析
            </h3>
            <p className="text-purple-200 mb-6 text-center">
              与AI算命大师对话，获得关于事业、感情、财运等方面的专业指导
            </p>
            <Link
              href="/fortune-chat"
              className="block w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-center transition"
            >
              {isLoggedIn ? '开始算命' : '免费体验'}
            </Link>
          </div>

          {/* 塔罗牌占卜 */}
          <div className="card-hover bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              塔罗牌占卜
            </h3>
            <p className="text-purple-200 mb-6 text-center">
              抽取神秘的塔罗牌，让AI为您解读牌面，指引人生方向
            </p>
            <Link
              href="/tarot"
              className="block w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-center transition"
            >
              {isLoggedIn ? '开始占卜' : '免费体验'}
            </Link>
          </div>
        </div>

        {/* 特点介绍 */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">为什么选择我们</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="fade-in">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold text-white mb-2">AI智能</h4>
              <p className="text-purple-200">
                采用先进的DeepSeek AI，结合传统命理知识
              </p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-4">🔮</div>
              <h4 className="text-xl font-semibold text-white mb-2">专业准确</h4>
              <p className="text-purple-200">
                基于生辰八字和塔罗牌理论，提供专业解读
              </p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-xl font-semibold text-white mb-2">历史记录</h4>
              <p className="text-purple-200">
                保存您的算命历史，随时回顾查看
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-purple-200">
          <p>&copy; 2024 AI算命. 仅供娱乐参考.</p>
        </div>
      </footer>
    </div>
  );
}
