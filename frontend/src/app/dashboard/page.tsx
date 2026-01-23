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

  useEffect(() => {
    router.prefetch('/history');
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchHistoryCache = async () => {
      try {
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem(
            'history_cache',
            JSON.stringify({ ts: Date.now(), data })
          );
        }
      } catch (error) {
        // ignore cache errors
      }
    };

    fetchHistoryCache();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Arcane Oracle
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 text-white hover:text-purple-300">
              Sanctum
            </Link>
            <Link href="/fortune-chat" className="px-4 py-2 text-white hover:text-purple-300">
              Oracle Chat
            </Link>
            <Link href="/tarot" className="px-4 py-2 text-white hover:text-purple-300">
              Tarot
            </Link>
            <Link href="/history" className="px-4 py-2 text-white hover:text-purple-300">
              Chronicles
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Welcome back, {user?.username}.</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-purple-200 mb-2">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
              {user?.birth_date && (
                <div>
                  <p className="text-purple-200 mb-2">Birth Date</p>
                  <p className="text-white">{user.birth_date}</p>
                </div>
              )}
              {user?.gender && (
                <div>
                  <p className="text-purple-200 mb-2">Gender</p>
                  <p className="text-white">
                    {user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <h3 className="text-2xl font-bold text-white mb-6">Begin a Reading</h3>
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
                <h4 className="text-xl font-bold text-white">Oracle Dialogue</h4>
              </div>
              <p className="text-purple-200">Seek guidance from the oracle on love, career, and fortune.</p>
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
                <h4 className="text-xl font-bold text-white">Tarot Divination</h4>
              </div>
              <p className="text-purple-200">Draw the sacred cards and explore the unseen answer.</p>
            </Link>
          </div>

          {/* History */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Recent Chronicles</h3>
            <button
              onClick={() => router.push('/history')}
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              View All Chronicles
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
