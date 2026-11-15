'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed.');
      }
      router.replace('/');
      router.refresh();
    } catch (loginError: any) {
      setError(loginError.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f2eb] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-[#d7c1a8] bg-white p-7 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b28867] text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2f1f1a]">CozySpace Dashboard</h1>
          <p className="mt-1 text-xs text-[#7c5742]">Sign in to continue</p>
        </div>

        <div className="space-y-3">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
            className="w-full rounded-xl border border-[#d7c1a8] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#9b7053]"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-[#d7c1a8] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#9b7053]"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#553c30] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          <LockKeyhole className="h-4 w-4" />
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
