'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface TarotCard {
  id: number;
  name_cn: string;
  name_en: string;
  card_number: number;
  suit: string;
  upright_meaning: string;
  reversed_meaning: string;
  description: string;
}

interface DrawnCard extends TarotCard {
  is_reversed: boolean;
}

export default function TarotPage() {
  const router = useRouter();
  const [step, setStep] = useState<'question' | 'drawing' | 'result'>('question');
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleDrawCards = async () => {
    if (!question.trim()) {
      alert('请先输入您想要咨询的问题');
      return;
    }

    // 检查未登录用户的使用次数
    let shouldBlur = false;
    if (!isLoggedIn) {
      const tarotUsageCount = parseInt(localStorage.getItem('tarot_usage_count') || '0');
      if (tarotUsageCount >= 1) {
        shouldBlur = true;
        setIsBlurred(true);
      }
      // 增加使用次数
      localStorage.setItem('tarot_usage_count', (tarotUsageCount + 1).toString());
    }

    setLoading(true);
    setStep('drawing');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tarot/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          question,
          spread_type: 'three-card',
        }),
      });

      const data = await res.json();

      if (data.success) {
        // 模拟抽牌动画延迟
        setTimeout(() => {
          setDrawnCards(data.cards);
          setInterpretation(data.interpretation);
          setStep('result');
          setLoading(false);

          // 如果需要模糊显示，延迟显示登录提示
          if (shouldBlur) {
            setTimeout(() => {
              setShowLoginPrompt(true);
            }, 1000);
          }
        }, 2000);
      } else {
        throw new Error(data.error || '抽牌失败');
      }
    } catch (error: any) {
      alert(error.message || '抽牌失败，请稍后重试');
      setLoading(false);
      setStep('question');
    }
  };

  const handleReset = () => {
    setStep('question');
    setQuestion('');
    setDrawnCards([]);
    setInterpretation('');
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
      <main className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">塔罗牌占卜</h1>
          <p className="text-purple-200">让神秘的塔罗牌为您指引方向</p>
        </div>

        {/* 输入问题阶段 */}
        {step === 'question' && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              请输入您的问题
            </h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：我的事业发展如何？我的感情会顺利吗？"
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-500 mb-6 resize-none"
            />
            <button
              onClick={handleDrawCards}
              disabled={!question.trim()}
              className="w-full py-4 bg-mystic-gradient rounded-lg text-white text-lg font-semibold hover:opacity-90 transition disabled:opacity-50 mystic-glow"
            >
              开始抽牌
            </button>
          </div>
        )}

        {/* 抽牌中动画 */}
        {step === 'drawing' && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center relative" style={{ minHeight: '600px', overflow: 'visible' }}>
            {/* 多层旋转魔法阵背景 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
              <div className="w-[500px] h-[500px] border-4 border-purple-500 rounded-full animate-spin-slow"></div>
              <div className="absolute w-[450px] h-[450px] border-4 border-pink-500 rounded-full animate-spin-reverse"></div>
              <div className="absolute w-[400px] h-[400px] border-2 border-purple-400 rounded-full animate-spin-slow" style={{ animationDuration: '25s' }}></div>
              <div className="absolute w-[350px] h-[350px] border-2 border-pink-400 rounded-full animate-spin-reverse" style={{ animationDuration: '18s' }}></div>
            </div>

            {/* 闪烁的星星粒子 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* 能量波纹效果 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-32 h-32 border-2 border-purple-400 rounded-full"
                  style={{
                    animation: `energyWave 3s ease-out infinite`,
                    animationDelay: `${i * 1}s`,
                    opacity: 0,
                  }}
                ></div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-white mb-4 relative z-10 animate-pulse">
              正在为您抽取塔罗牌...
            </h2>
            <p className="text-purple-200 mb-8 relative z-10">请保持内心平静，专注于您的问题</p>

            {/* 3D旋转的塔罗牌圆圈 - 旋转木马效果 */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                perspective: '2000px',
                perspectiveOrigin: 'center center',
                width: '100%',
                height: '100%',
              }}
            >
              {/* 3D圆圈容器 - 围绕Y轴旋转 */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '1px',
                  height: '1px',
                  transformStyle: 'preserve-3d',
                  animation: 'rotateCarousel 10s linear 0.8s forwards',
                }}
              >
                {[...Array(18)].map((_, index) => {
                  const angle = (index * 20); // 每张牌间隔20度 (360/18)
                  const radius = 350; // 增大圆圈半径
                  const isSelected = index === 4 || index === 9 || index === 14; // 选中3张牌

                  return (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: '0',
                        top: '0',
                        width: '90px',
                        height: '130px',
                        marginLeft: '-45px',
                        marginTop: '-65px',
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        animation: isSelected
                          ? `cardFadeIn 0.8s ease-out forwards, selectCardCarousel 0.6s ease-out ${4 + index * 0.2}s forwards, flyOutCarousel${index === 4 ? '1' : index === 9 ? '2' : '3'} 1.2s ease-out 7.5s forwards`
                          : `cardFadeIn 0.8s ease-out forwards, fadeOutCard3D 0.5s ease-out 7.5s forwards`,
                        opacity: 0,
                        zIndex: isSelected ? 50 : 10,
                      }}
                    >
                      <div
                        className="w-full h-full bg-gradient-to-br from-purple-700 to-pink-700 rounded-lg shadow-2xl border-2 border-white/30 flex items-center justify-center text-white text-3xl"
                        style={{
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        🎴
                      </div>

                      {/* 选中时的光环效果 */}
                      {isSelected && (
                        <>
                          <div
                            className="absolute inset-0 bg-yellow-400 rounded-lg blur-xl pointer-events-none"
                            style={{
                              opacity: 0,
                              animation: `glowPulseCarousel 0.6s ease-out ${4 + index * 0.2}s forwards`,
                              zIndex: -1,
                            }}
                          ></div>
                          {/* 能量粒子爆发 */}
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                              style={{
                                left: '50%',
                                top: '50%',
                                marginLeft: '-4px',
                                marginTop: '-4px',
                                opacity: 0,
                                animation: `particleBurstCarousel 0.8s ease-out ${4 + index * 0.2 + i * 0.03}s forwards`,
                                transform: `rotate(${i * 30}deg) translateY(0px)`,
                              }}
                            ></div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 手指指针 - 指向前方中间的牌 */}
            <div
              className="absolute text-6xl z-50 pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-30px',
                marginTop: '80px',
                opacity: 0,
                animation: 'handPointerAppear 0.5s ease-out 3.5s forwards, handPointPulse 0.5s ease-in-out 4s infinite',
              }}
            >
              👆
            </div>

            {/* 中心能量球 */}
            <div
              className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-lg pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-40px',
                marginTop: '-40px',
                animation: 'centerPulse 2s ease-in-out infinite',
                opacity: 0.5,
                zIndex: 5,
              }}
            ></div>

            <style jsx>{`
              /* 3D卡片淡入动画 */
              @keyframes cardFadeIn {
                0% {
                  opacity: 0;
                }
                100% {
                  opacity: 1;
                }
              }

              /* 旋转木马动画 - 围绕Y轴旋转 */
              @keyframes rotateCarousel {
                0% {
                  transform: rotateY(0deg);
                }
                100% {
                  transform: rotateY(360deg);
                }
              }

              /* 选中卡片旋转木马效果 */
              @keyframes selectCardCarousel {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.4);
                }
                100% {
                  transform: scale(1.3);
                }
              }

              /* 旋转木马光环脉冲 */
              @keyframes glowPulseCarousel {
                0% {
                  opacity: 0;
                }
                50% {
                  opacity: 0.9;
                }
                100% {
                  opacity: 0.7;
                }
              }

              /* 旋转木马粒子爆发 */
              @keyframes particleBurstCarousel {
                0% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
                100% {
                  opacity: 0;
                  transform: translateY(-60px) scale(0);
                }
              }

              /* 3D卡片淡出 */
              @keyframes fadeOutCard3D {
                0% {
                  opacity: 1;
                }
                100% {
                  opacity: 0;
                }
              }

              /* 手指指针出现 */
              @keyframes handPointerAppear {
                0% {
                  opacity: 0;
                  transform: scale(0.5) translateY(-20px);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }

              /* 手指指针脉冲 */
              @keyframes handPointPulse {
                0%, 100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
              }

              /* 旋转木马飞出到最终位置 - 左侧 */
              @keyframes flyOutCarousel1 {
                0% {
                  opacity: 1;
                  transform: scale(1.3) translateZ(0);
                }
                100% {
                  opacity: 1;
                  transform: scale(1.3) translateX(-220px) translateY(0px) translateZ(200px) rotateY(0deg);
                }
              }

              /* 旋转木马飞出到最终位置 - 中间 */
              @keyframes flyOutCarousel2 {
                0% {
                  opacity: 1;
                  transform: scale(1.3) translateZ(0);
                }
                100% {
                  opacity: 1;
                  transform: scale(1.3) translateY(0px) translateZ(200px) rotateY(0deg);
                }
              }

              /* 旋转木马飞出到最终位置 - 右侧 */
              @keyframes flyOutCarousel3 {
                0% {
                  opacity: 1;
                  transform: scale(1.3) translateZ(0);
                }
                100% {
                  opacity: 1;
                  transform: scale(1.3) translateX(220px) translateY(0px) translateZ(200px) rotateY(0deg);
                }
              }

              @keyframes energyWave {
                0% {
                  opacity: 0.8;
                  transform: scale(1);
                }
                100% {
                  opacity: 0;
                  transform: scale(4);
                }
              }

              @keyframes centerPulse {
                0%, 100% {
                  transform: scale(1);
                  opacity: 0.6;
                }
                50% {
                  transform: scale(1.3);
                  opacity: 0.9;
                }
              }

              @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }

              @keyframes spin-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }

              @keyframes twinkle {
                0%, 100% {
                  opacity: 0;
                  transform: scale(0);
                }
                50% {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .animate-spin-slow {
                animation: spin-slow 20s linear infinite;
              }

              .animate-spin-reverse {
                animation: spin-reverse 15s linear infinite;
              }

              .animate-twinkle {
                animation: twinkle 3s ease-in-out infinite;
              }
            `}</style>
          </div>
        )}

        {/* 结果展示 */}
        {step === 'result' && (
          <div className="space-y-8">
            {/* 显示问题 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-purple-200 mb-2">您的问题：</h3>
              <p className="text-white">{question}</p>
            </div>

            {/* 显示抽到的牌 */}
            <div className="grid md:grid-cols-3 gap-6">
              {drawnCards.map((drawnCard, index) => {
                const card = drawnCard; // DrawnCard extends TarotCard
                const isReversed = drawnCard.is_reversed || false;

                // 生成塔罗牌图片URL（使用可靠的图片源）
                const getCardImageUrl = (cardNumber: number, suit: string, cardNameEn: string) => {
                  // 将英文名称转换为URL友好格式
                  const urlFriendlyName = cardNameEn
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '');

                  if (suit === 'major') {
                    // 大阿卡纳：使用 tarot.com 的图片CDN
                    const majorArcanaMap: Record<number, string> = {
                      0: 'fool',
                      1: 'magician',
                      2: 'high_priestess',
                      3: 'empress',
                      4: 'emperor',
                      5: 'hierophant',
                      6: 'lovers',
                      7: 'chariot',
                      8: 'strength',
                      9: 'hermit',
                      10: 'wheel_of_fortune',
                      11: 'justice',
                      12: 'hanged_man',
                      13: 'death',
                      14: 'temperance',
                      15: 'devil',
                      16: 'tower',
                      17: 'star',
                      18: 'moon',
                      19: 'sun',
                      20: 'judgement',
                      21: 'world'
                    };
                    const cardSlug = majorArcanaMap[cardNumber] || 'fool';
                    return `https://www.trustedtarot.com/img/cards/${cardSlug}.png`;
                  }

                  // 小阿卡纳：使用数字和花色组合
                  const suitMap: Record<string, string> = {
                    'wands': 'wands',
                    'cups': 'cups',
                    'swords': 'swords',
                    'pentacles': 'pentacles'
                  };

                  const numberMap: Record<number, string> = {
                    1: 'ace',
                    2: 'two',
                    3: 'three',
                    4: 'four',
                    5: 'five',
                    6: 'six',
                    7: 'seven',
                    8: 'eight',
                    9: 'nine',
                    10: 'ten',
                    11: 'page',
                    12: 'knight',
                    13: 'queen',
                    14: 'king'
                  };

                  const suitName = suitMap[suit] || 'wands';
                  const numberName = numberMap[cardNumber] || 'ace';

                  return `https://www.trustedtarot.com/img/cards/${numberName}_of_${suitName}.png`;
                };

                const imageUrl = getCardImageUrl(card.card_number, card.suit, card.name_en);

                return (
                  <div
                    key={card.id}
                    className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden card-hover"
                  >
                    {/* 塔罗牌图片 */}
                    <div
                      className="relative h-80 bg-gray-900 flex items-center justify-center"
                      style={isBlurred ? { filter: 'blur(8px)', userSelect: 'none', pointerEvents: 'none' } : {}}
                    >
                      <img
                        src={imageUrl}
                        alt={card.name_cn}
                        className="h-full w-auto object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          // 尝试备用图片源
                          if (!img.dataset.fallbackAttempt) {
                            img.dataset.fallbackAttempt = '1';
                            // 备用源1: 使用不同的CDN
                            const suit = card.suit;
                            const num = card.card_number;
                            if (suit === 'major') {
                              img.src = `https://www.sacred-texts.com/tarot/pkt/img/ar${num.toString().padStart(2, '0')}.jpg`;
                            } else {
                              const suitCode = suit === 'wands' ? 'wa' : suit === 'cups' ? 'cu' : suit === 'swords' ? 'sw' : 'pe';
                              const courtMap: Record<number, string> = { 11: 'pa', 12: 'kn', 13: 'qu', 14: 'ki' };
                              const code = courtMap[num] || num.toString().padStart(2, '0');
                              img.src = `https://www.sacred-texts.com/tarot/pkt/img/${suitCode}${code}.jpg`;
                            }
                          } else if (img.dataset.fallbackAttempt === '1') {
                            img.dataset.fallbackAttempt = '2';
                            // 备用源2: 显示美化的占位符
                            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="350"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(139,92,246);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(236,72,153);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23grad)" width="200" height="350" rx="10"/%3E%3Ctext fill="%23fff" x="50%25" y="45%25" text-anchor="middle" font-size="16" font-weight="bold"%3E' + encodeURIComponent(card.name_cn) + '%3C/text%3E%3Ctext fill="%23fff" x="50%25" y="55%25" text-anchor="middle" font-size="12" opacity="0.8"%3E' + encodeURIComponent(card.name_en) + '%3C/text%3E%3Ctext fill="%23fff" x="50%25" y="70%25" text-anchor="middle" font-size="40"%3E🎴%3C/text%3E%3C/svg%3E';
                          }
                        }}
                      />
                      {/* 正逆位标识 */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                        isReversed ? 'bg-red-500/90' : 'bg-green-500/90'
                      } text-white shadow-lg`}>
                        {isReversed ? '逆位' : '正位'}
                      </div>
                    </div>

                    {/* 牌名和基本含义 */}
                    <div
                      className="p-5"
                      style={isBlurred ? { filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' } : {}}
                    >
                      <h4 className="text-lg font-bold text-white mb-1 text-center">
                        {card.name_cn}
                      </h4>
                      <p className="text-xs text-purple-300 mb-3 text-center">{card.name_en}</p>

                      <p className="text-sm text-purple-100 text-center leading-relaxed">
                        {card.description || '神秘的塔罗牌，蕴含着深刻的智慧与启示'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI解读 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 relative">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🔮</span>
                AI大师解读
              </h3>
              <div
                className="text-purple-100 leading-relaxed prose prose-invert max-w-none"
                style={isBlurred ? { filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' } : {}}
              >
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="text-purple-100 mb-3" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                    em: ({node, ...props}) => <em className="text-pink-300" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-purple-100" {...props} />,
                  }}
                >
                  {interpretation}
                </ReactMarkdown>
              </div>
              {/* 模糊遮罩层 */}
              {isBlurred && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(236, 72, 153, 0.4) 100%)',
                  }}
                ></div>
              )}
            </div>

            {/* 重新占卜按钮 */}
            <div className="text-center">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-mystic-gradient rounded-lg text-white font-semibold hover:opacity-90 transition"
              >
                重新占卜
              </button>
            </div>
          </div>
        )}
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
                您已使用完免费的塔罗占卜体验次数。登录后可继续使用此功能哦~ 😊💫
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
