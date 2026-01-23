'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Arcane Oracle
          </div>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                >
                  Sanctum
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                    router.push('/');
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-mystic-gradient text-white transition hover:opacity-90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 fade-in">
          <h1 className="text-6xl font-bold text-white mb-6 animate-float">
            Unveil the Threads of Fate
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Ancient divination woven with modern AI, delivering guidance for those who seek the unseen.
          </p>
          {!isLoggedIn && (
            <Link
              href="/login"
              className="inline-block px-8 py-4 rounded-lg bg-mystic-gradient text-white text-lg font-semibold hover:opacity-90 transition mystic-glow"
            >
              Begin Your Reading
            </Link>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Oracle Chat */}
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
              Oracle Dialogue
            </h3>
            <p className="text-purple-200 mb-6 text-center">
              Speak with the AI oracle to unveil insight on love, career, and fortune.
            </p>
            <Link
              href="/fortune-chat"
              className="block w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-center transition"
            >
              {isLoggedIn ? 'Consult the Oracle' : 'Free Trial'}
            </Link>
          </div>

          {/* Tarot */}
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
              Tarot Divination
            </h3>
            <p className="text-purple-200 mb-6 text-center">
              Draw sacred cards and let the oracle interpret the path ahead.
            </p>
            <Link
              href="/tarot"
              className="block w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-center transition"
            >
              {isLoggedIn ? 'Draw the Cards' : 'Free Trial'}
            </Link>
          </div>
        </div>

        {/* Why Us */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Why Seek Our Circle</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="fade-in">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold text-white mb-2">Arcane AI</h4>
              <p className="text-purple-200">
                Advanced intelligence entwined with occult lore.
              </p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-4">🔮</div>
              <h4 className="text-xl font-semibold text-white mb-2">Mystic Precision</h4>
              <p className="text-purple-200">
                Grounded in birth charts and tarot doctrine for refined readings.
              </p>
            </div>
            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-xl font-semibold text-white mb-2">Chronicles</h4>
              <p className="text-purple-200">
                Preserve your readings and revisit them whenever you wish.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-purple-200">
          <p>&copy; 2024 Arcane Oracle. For entertainment only.</p>
        </div>
      </footer>
    </div>
  );
}
