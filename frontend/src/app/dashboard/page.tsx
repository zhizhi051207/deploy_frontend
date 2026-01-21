'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            神秘AI算命
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 text-white hover:text-purple-300">
              控制台
            </Link>
            <Link href="/fortune-chat" className="px-4 py-2 text-white hover:text-purple-300">
              AI算命
            </Link>
            <Link href="/tarot" className="px-4 py-2 text-white hover:text-purple-300">
              塔罗占卜
            </Link>
            <Link href="/history" className="px-4 py-2 text-white hover:text-purple-300">
              历史记录
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
            >
              退出
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 用户信息卡片 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">欢迎回来，{user?.username}!</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-purple-200 mb-2">邮箱</p>
                <p className="text-white">{user?.email}</p>
              </div>
              {user?.birth_date && (
                <div>
                  <p className="text-purple-200 mb-2">出生日期</p>
                  <p className="text-white">{user.birth_date}</p>
                </div>
              )}
              {user?.gender && (
                <div>
                  <p className="text-purple-200 mb-2">性别</p>
                  <p className="text-white">
                    {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 功能快捷入口 */}
          <h3 className="text-2xl font-bold text-white mb-6">开始占卜</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/fortune-chat"
              className="card-hover bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">AI对话算命</h4>
              </div>
              <p className="text-purple-200">向AI算命大师咨询您的困惑，获得专业指导</p>
            </Link>

            <Link
              href="/tarot"
              className="card-hover bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white">塔罗牌占卜</h4>
              </div>
              <p className="text-purple-200">抽取神秘的塔罗牌，探索未知的答案</p>
            </Link>
          </div>

          {/* 历史记录 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">最近记录</h3>
            <Link
              href="/history"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              查看全部历史记录
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
