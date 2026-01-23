'use client';

import { useState, type ReactNode } from 'react';
import * as Select from '@radix-ui/react-select';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birth_date: '',
    birth_time: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          birth_date: formData.birth_date || undefined,
          birth_time: formData.birth_time || undefined,
          gender: formData.gender || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Sign up failed');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SelectItem = ({ value, children }: { value: string; children: ReactNode }) => (
    <Select.Item
      value={value}
      className="relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-white outline-none focus:bg-purple-500/20 data-[state=checked]:bg-purple-600/40 data-[state=checked]:text-white"
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Create Account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-purple-200 mb-2">Username*</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Email*</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Password*</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Confirm Password*</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-purple-200 text-sm mb-3">Optional details to deepen your reading</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-purple-200 text-sm mb-2">Birth Date</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-purple-200 text-sm mb-2">Birth Time</label>
                <input
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-purple-200 text-sm mb-2">Gender</label>
              <Select.Root
                value={formData.gender || 'unset'}
                onValueChange={(value) => setFormData({ ...formData, gender: value === 'unset' ? '' : value })}
              >
                <Select.Trigger
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <Select.Value placeholder="Select" />
                  <Select.Icon>
                    <svg
                      className="h-4 w-4 text-purple-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    position="popper"
                    className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-white/10 bg-slate-950/95 shadow-xl backdrop-blur"
                  >
                    <Select.Viewport className="p-1">
                      <SelectItem value="unset">Select</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-mystic-gradient rounded-lg text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-purple-200">
          Already have an account?
          <Link href="/login" className="text-pink-400 hover:text-pink-300 ml-1">
            Sign In
          </Link>
        </p>

        <Link
          href="/"
          className="block mt-4 text-center text-purple-300 hover:text-purple-200"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
