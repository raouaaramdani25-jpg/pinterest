import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CozySpace Automation Studio | Pinterest & Amazon Affiliate Growth Engine',
  description: 'Automated blog generation, Pinterest Pins studio, Amazon Affiliate conversion engine, and 1-click WordPress publisher for CozySpace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf7f2] text-[#2f1f1a] min-h-screen flex flex-col selection:bg-[#e8dbca] selection:text-[#2f1f1a]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-[#e8dbca] bg-[#f4ede2]/60 py-6 text-center text-xs text-[#7c5742]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} CozySpace Company • Automated Pinterest & Affiliate Engine</p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              Amazon Associates Compliant • Astra Theme Optimized
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
