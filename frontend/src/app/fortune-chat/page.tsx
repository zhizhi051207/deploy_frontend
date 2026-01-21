'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  blurred?: boolean;
}

export default function FortuneChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '欢迎来到AI算命大师的世界。我将结合您的生辰八字和问题，为您提供专业的命理指导。请问您想咨询什么问题？',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetchUserInfo();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 检查未登录用户的使用次数
    let isLimitedResponse = false;
    if (!isLoggedIn) {
      const chatUsageCount = parseInt(localStorage.getItem('chat_usage_count') || '0');
      if (chatUsageCount >= 1) {
        isLimitedResponse = true;
      }
      // 增加使用次数
      localStorage.setItem('chat_usage_count', (chatUsageCount + 1).toString());
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/fortune/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          question: input,
          history: messages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const content = data.result;

        // 如果是受限响应，显示完整内容但标记为模糊
        const assistantMessage: Message = {
          role: 'assistant',
          content: content,
          blurred: isLimitedResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (isLimitedResponse) {
          setTimeout(() => {
            setShowLoginPrompt(true);
          }, 500);
        }
      } else {
        throw new Error(data.error || '算命失败');
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，算命服务暂时出现问题，请稍后再试。',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            神秘AI算命
          </Link>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
            >
              返回主页
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              控制台
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 container mx-auto px-6 py-8 flex flex-col max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">AI对话算命</h1>
          {user && (
            <p className="text-purple-200">
              {user.birth_date && user.birth_time
                ? `生辰: ${user.birth_date} ${user.birth_time}`
                : '未设置生辰信息'}
            </p>
          )}
        </div>

        {/* 聊天消息区域 */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 relative ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-purple-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="relative">
                      <div
                        className="prose prose-invert max-w-none"
                        style={message.blurred ? { filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' } : {}}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                            em: ({node, ...props}) => <em className="text-pink-300" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {message.blurred && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/80 pointer-events-none"></div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-4 py-3 text-purple-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入您的问题..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-mystic-gradient rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            发送
          </button>
        </form>
      </main>

      {/* 登录提示弹窗 */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔮✨</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                免费体验已用完
              </h3>
              <p className="text-purple-200 leading-relaxed">
                您已使用完免费的AI算命体验次数。登录后可继续使用此功能哦~ 😊💫
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full py-3 bg-mystic-gradient rounded-lg text-white text-center font-semibold hover:opacity-90 transition"
              >
                立即登录
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
