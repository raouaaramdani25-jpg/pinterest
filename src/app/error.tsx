'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('CozySpace Studio runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center text-center p-6 space-y-4 bg-white rounded-2xl border border-[#e8dbca] shadow-sm my-8">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold font-serif text-[#2f1f1a]">Something went wrong</h2>
      <p className="text-xs text-[#7c5742] max-w-md leading-relaxed">
        {error?.message || 'An unexpected client error occurred. The system has prevented a crash.'}
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f4ede2] hover:bg-[#e8dbca] text-[#2f1f1a] text-xs font-bold transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
