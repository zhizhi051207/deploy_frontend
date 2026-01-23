'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fortunes, setFortunes] = useState<FortuneHistory[]>([]);
  const [hasCache, setHasCache] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);


  const [tarotReadings, setTarotReadings] = useState<TarotReading[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'tarot'>('chat');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState<FortuneHistory | null>(null);
  const [selectedTarot, setSelectedTarot] = useState<TarotReading | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState('');
  const [tarotFollowUpQuestion, setTarotFollowUpQuestion] = useState('');
  const [tarotFollowUpAnswer, setTarotFollowUpAnswer] = useState('');
  const [tarotFollowUpLoading, setTarotFollowUpLoading] = useState(false);
  const [tarotFollowUpError, setTarotFollowUpError] = useState('');
  const fetchHistory = async () => {
    try {
      if (!hasCache) {
        setLoading(true);
        setShowLoading(false);
        if (loadingTimerRef.current) {
          clearTimeout(loadingTimerRef.current);
        }
        loadingTimerRef.current = setTimeout(() => {
          setShowLoading(true);
        }, 3000);
      }
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
      sessionStorage.setItem(
        'history_cache',
        JSON.stringify({ ts: Date.now(), data })
      );
      setHasCache(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chronicles');
    } finally {
      if (!hasCache) {
        setLoading(false);
      }
      setShowLoading(false);
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
          setShowLoading(false);

        loadingTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('history_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.ts && Date.now() - parsed.ts < 5 * 60 * 1000) {
          const data = parsed.data || {};
          setFortunes(data.fortunes || []);
          setTarotReadings(data.tarot_readings || []);
          setLoading(false);
          setHasCache(true);
        }
      }
    } catch (err) {
      // ignore cache errors
    }
  }, []);

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

  const openFortuneDetail = (item: FortuneHistory) => {
    setSelectedFortune(item);
    setSelectedTarot(null);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUpError('');
    setTarotFollowUpQuestion('');
    setTarotFollowUpAnswer('');
    setTarotFollowUpError('');
  };

  const openTarotDetail = (item: TarotReading) => {
    setSelectedTarot(item);
    setSelectedFortune(null);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUpError('');
    setTarotFollowUpQuestion('');
    setTarotFollowUpAnswer('');
    setTarotFollowUpError('');
  };

  const closeDetail = () => {
    setSelectedFortune(null);
    setSelectedTarot(null);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUpError('');
    setFollowUpLoading(false);
    setTarotFollowUpQuestion('');
    setTarotFollowUpAnswer('');
    setTarotFollowUpError('');
    setTarotFollowUpLoading(false);
  };

  const handleFollowUp = async () => {
    if (!selectedFortune) return;
    const question = followUpQuestion.trim();
    if (!question) {
      setFollowUpError('Please enter your question');
      return;
    }
    if (question.length > 500) {
      setFollowUpError('Question cannot exceed 500 characters');
      return;
    }
    try {
      setFollowUpLoading(true);
      setFollowUpError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/history/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ history_id: selectedFortune.id, question }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }
      setFollowUpAnswer(data.answer || 'No response');
    } catch (err: any) {
      setFollowUpError(err.message || 'Failed to get response');
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleTarotFollowUp = async () => {
    if (!selectedTarot) return;
    const question = tarotFollowUpQuestion.trim();
    if (!question) {
      setTarotFollowUpError('Please enter your question');
      return;
    }
    if (question.length > 500) {
      setTarotFollowUpError('Question cannot exceed 500 characters');
      return;
    }
    try {
      setTarotFollowUpLoading(true);
      setTarotFollowUpError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/history/tarot-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ history_id: selectedTarot.id, question }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }
      setTarotFollowUpAnswer(data.answer || 'No response');
    } catch (err: any) {
      setTarotFollowUpError(err.message || 'Failed to get response');
    } finally {
      setTarotFollowUpLoading(false);
    }
  };


  const homeHref = isLoggedIn ? '/dashboard' : '/';

  useEffect(() => {
    router.prefetch(homeHref);
  }, [homeHref, router]);



  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Arcane Oracle
          </Link>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(homeHref)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
            >
              Return Home
            </button>
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


        {(selectedFortune || selectedTarot) && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
            <div className="bg-slate-900/95 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[85vh] relative">
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-lg leading-none"
                aria-label="Close details"
              >
                ×
              </button>

              <div className="max-h-[85vh] overflow-y-auto p-6 pt-12">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedFortune ? 'Oracle Chronicle' : 'Tarot Chronicle'}
                    </h2>
                    <p className="text-purple-200 text-sm">
                      {selectedFortune
                        ? new Date(selectedFortune.created_at).toLocaleString()
                        : selectedTarot
                        ? new Date(selectedTarot.created_at).toLocaleString()
                        : ''}
                    </p>
                  </div>
                </div>

                {selectedFortune && (
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div>
                      <p className="text-white font-semibold mb-2">Question: {selectedFortune.question}</p>
                      <div className="text-purple-100 prose prose-invert max-w-none">
                        <ReactMarkdown>{selectedFortune.result}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="lg:sticky lg:top-6 h-fit">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-white font-semibold mb-2">Ask a follow-up</h3>
                        <textarea
                          value={followUpQuestion}
                          onChange={(e) => setFollowUpQuestion(e.target.value)}
                          placeholder="Ask about your reading..."
                          className="w-full min-h-[120px] bg-white/10 border border-white/10 rounded-lg p-3 text-white placeholder:text-purple-200/70 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {followUpError && (
                          <p className="text-red-400 text-sm mt-2">{followUpError}</p>
                        )}
                        <button
                          onClick={handleFollowUp}
                          disabled={followUpLoading}
                          className="mt-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-60"
                        >
                          {followUpLoading ? 'Thinking...' : 'Ask the Oracle'}
                        </button>

                        {followUpAnswer && (
                          <div className="mt-4 text-purple-100 prose prose-invert max-w-none">
                            <ReactMarkdown>{followUpAnswer}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTarot && (
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-4">
                      <p className="text-white font-semibold">Spread: {selectedTarot.spread_type}</p>
                      <div className="text-purple-100 prose prose-invert max-w-none">
                        <ReactMarkdown>{selectedTarot.interpretation}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="lg:sticky lg:top-6 h-fit">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-white font-semibold mb-2">Ask a follow-up</h3>
                        <textarea
                          value={tarotFollowUpQuestion}
                          onChange={(e) => setTarotFollowUpQuestion(e.target.value)}
                          placeholder="Ask about your tarot reading..."
                          className="w-full min-h-[120px] bg-white/10 border border-white/10 rounded-lg p-3 text-white placeholder:text-purple-200/70 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {tarotFollowUpError && (
                          <p className="text-red-400 text-sm mt-2">{tarotFollowUpError}</p>
                        )}
                        <button
                          onClick={handleTarotFollowUp}
                          disabled={tarotFollowUpLoading}
                          className="mt-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-60"
                        >
                          {tarotFollowUpLoading ? 'Thinking...' : 'Ask the Oracle'}
                        </button>

                        {tarotFollowUpAnswer && (
                          <div className="mt-4 text-purple-100 prose prose-invert max-w-none">
                            <ReactMarkdown>{tarotFollowUpAnswer}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showLoading && fortunes.length === 0 && tarotReadings.length === 0 && (
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
              <div key={item.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-purple-200 text-sm mb-2">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="text-white font-semibold mb-2">Question: {item.question}</p>
                    <p className="text-purple-200 text-sm">
                      {(item.result || '').slice(0, 120)}{item.result && item.result.length > 120 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openFortuneDetail(item)}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete('fortune', item.id)}
                      className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500 text-white text-sm"
                    >
                      Delete
                    </button>
                  </div>
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
              <div key={item.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-purple-200 text-sm mb-2">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="text-white font-semibold mb-2">Spread: {item.spread_type}</p>
                    <p className="text-purple-200 text-sm">
                      {(item.interpretation || '').slice(0, 120)}{item.interpretation && item.interpretation.length > 120 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openTarotDetail(item)}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete('tarot', item.id)}
                      className="px-3 py-1 rounded bg-red-500/80 hover:bg-red-500 text-white text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
