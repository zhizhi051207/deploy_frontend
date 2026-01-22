'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface FortuneHistory {
  id: number;
  question?: string;
  result: string;
  created_at: string;
}

interface TarotReading {
  id: number;
  spread_type: string;
  cards_drawn: any[];
  interpretation: string;
  created_at: string;
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [fortunes, setFortunes] = useState<FortuneHistory[]>([]);
  const [tarotReadings, setTarotReadings] = useState<TarotReading[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'tarot'>('chat');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);



  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch chronicles');
      }
      setFortunes(data.fortunes || []);
      setTarotReadings(data.tarot_readings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chronicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);


  const handleDelete = async (type: 'fortune' | 'tarot', id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/history?type=${type}&id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Deletion failed');
      }
      fetchHistory();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  const homeHref = isLoggedIn ? '/dashboard' : '/';


  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Arcane Oracle
          </Link>
          <div className="flex gap-4">
            <Link
              href={homeHref}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
            >
              Return Home
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              Sanctum
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Chronicles</h1>
          <p className="text-purple-200">Revisit your divinations at any time</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'chat' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}
          >
            Oracle Chat
          </button>
          <button
            onClick={() => setActiveTab('tarot')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'tarot' ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}
          >
            Tarot
          </button>
        </div>

        {loading && (
          <div className="text-center text-purple-200">Loading...</div>
        )}

        {error && (
          <div className="text-center text-red-400">{error}</div>
        )}

        {!loading && !error && activeTab === 'chat' && (
          <div className="space-y-6">
            {fortunes.length === 0 && (
              <div className="text-center text-purple-200">No oracle chronicles yet</div>
            )}
            {fortunes.map((item) => (
              <div key={item.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-purple-200 text-sm mb-2">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="text-white font-semibold mb-2">Question: {item.question}</p>
                    <div className="text-purple-100 prose prose-invert max-w-none">
                      <ReactMarkdown>{item.result}</ReactMarkdown>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete('fortune', item.id)}
                    className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && activeTab === 'tarot' && (
          <div className="space-y-6">
            {tarotReadings.length === 0 && (
              <div className="text-center text-purple-200">No tarot chronicles yet</div>
            )}
            {tarotReadings.map((item) => (
              <div key={item.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-purple-200 text-sm mb-2">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="text-white font-semibold mb-3">Spread: {item.spread_type}</p>
                    <div className="text-purple-100 prose prose-invert max-w-none">
                      <ReactMarkdown>{item.interpretation}</ReactMarkdown>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete('tarot', item.id)}
                    className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
