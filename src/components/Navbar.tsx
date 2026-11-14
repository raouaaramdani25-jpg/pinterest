'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Pin, Globe, Compass, Settings, Home, BookOpen } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Article Generator', href: '/generator', icon: Sparkles },
    { label: 'Pinterest Pin Studio', href: '/pin-studio', icon: Pin },
    { label: 'WordPress Publisher', href: '/wordpress', icon: Globe },
    { label: 'Pinterest Trends', href: '/trends', icon: Compass },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#e8dbca]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9b7053] to-[#c3a384] flex items-center justify-center text-white shadow-md shadow-[#9b7053]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#2f1f1a] font-serif">
                CozySpace
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-[#9b7053] uppercase">
                Automation Studio
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#e8dbca] text-[#2f1f1a] shadow-sm'
                      : 'text-[#7c5742] hover:bg-[#f4ede2] hover:text-[#2f1f1a]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#9b7053]' : 'text-[#9b7053]/70'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Tag & WP Live badge */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4ede2] border border-[#d7c1a8] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[#674738] font-mono font-medium">Tag: cozyplace04-20</span>
            </div>
            <a
              href="https://cozyspace.company"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              Visit Site
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
