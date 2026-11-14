'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('CozySpace Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#faf7f2] text-[#2f1f1a] min-h-screen flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#e8dbca] shadow-md space-y-4">
          <h2 className="text-2xl font-bold font-serif text-[#2f1f1a]">CozySpace Application Error</h2>
          <p className="text-xs text-[#7c5742] leading-relaxed">
            {error?.message || 'A global boundary error was caught.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-bold transition-all shadow-sm"
          >
            Reload Studio
          </button>
        </div>
      </body>
    </html>
  );
}
