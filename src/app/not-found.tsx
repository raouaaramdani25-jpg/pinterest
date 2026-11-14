import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4 bg-white rounded-2xl border border-[#e8dbca] shadow-sm my-8">
      <h2 className="text-2xl font-bold font-serif text-[#2f1f1a]">Page Not Found</h2>
      <p className="text-xs text-[#7c5742] max-w-sm">
        The page you are looking for does not exist in CozySpace Automation Studio.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-bold transition-colors shadow-sm"
      >
        <Home className="w-3.5 h-3.5" />
        Return to Dashboard
      </Link>
    </div>
  );
}
