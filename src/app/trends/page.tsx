'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Compass, TrendingUp, Sparkles, Pin, ArrowRight, ExternalLink } from 'lucide-react';

const TRENDS_DATA = [
  {
    keyword: 'Cozy Sunroom Decor',
    growth: '+930%',
    category: 'Home Decor',
    description: 'Natural light retreats filled with rattan daybeds, warm neutral textiles, and indoor citrus trees.',
    suggestedTitle: '10 Cozy Sunroom Decor Ideas to Soak Up Golden Hour All Year Long',
    amazonAngle: 'Rattan chairs, botanical linen pillows, warm solar lanterns',
  },
  {
    keyword: 'Air Purifying Plants & Aesthetic Planters',
    growth: '+850%',
    category: 'Plant Styling',
    description: 'Indoor wellness greenery arranged in fluted ceramic and ribbed terracotta planters.',
    suggestedTitle: '8 Best Air Purifying Plants with Aesthetic Amazon Planters Under $30',
    amazonAngle: 'Fluted ceramic pots, plant stands, moisture meters, snake plants',
  },
  {
    keyword: 'Flower & Candle Bouquets',
    growth: '+720%',
    category: 'Room Aesthetic',
    description: 'Sculptural floral pillar candles and soy wax bouquets that double as aesthetic shelf decor.',
    suggestedTitle: '7 Aesthetic Flower Candle Bouquets You Need on Your Coffee Table',
    amazonAngle: 'Pastel flower candles, vintage glass taper candle holders',
  },
  {
    keyword: 'Sage & Dusty Blue Color Palette',
    growth: '+570%',
    category: 'Color Trends',
    description: 'Calming, serene organic modern hues that replace clinical grey with earthy warmth.',
    suggestedTitle: '9 Sage Green & Dusty Blue Living Room Ideas for Instant Serenity',
    amazonAngle: 'Velvet sage throw pillows, muted blue ceramic vases, linen curtains',
  },
  {
    keyword: 'Japanese Zen & Minimalist Living',
    growth: '+270%',
    category: 'Zen Aesthetic',
    description: 'Low-profile solid wood furniture, tatami textures, and warm paper lantern lamps.',
    suggestedTitle: '10 Japanese Zen Living Room Ideas for a Clutter-Free, Peaceful Home',
    amazonAngle: 'Akari style paper lamps, floor cushions, low bamboo coffee tables',
  },
  {
    keyword: 'Dreamy Ambient Room Lighting',
    growth: '+255%',
    category: 'Lighting',
    description: 'Ditching the big overhead light forever in favor of soft 2200K amber lights and smart diffusers.',
    suggestedTitle: '8 Ambient Lighting Pieces That Make Your Bedroom Feel Like a 5-Star Spa',
    amazonAngle: 'Mushroom table lamps, flame effect diffusers, LED fairy branch lights',
  },
];

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2f1f1a] flex items-center gap-2">
            <Compass className="w-7 h-7 text-[#9b7053]" />
            Pinterest & Home Decor Trends
          </h1>
          <p className="text-xs sm:text-sm text-[#7c5742]">
            Real-time viral search spikes from Pinterest Official Trend Reports & Exa Search data.
          </p>
        </div>

        <a
          href="https://newsroom.pinterest.com/news/the-pinterest-fall-2024-trend-report/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#9b7053] hover:text-[#553c30] font-semibold inline-flex items-center gap-1"
        >
          Source: Pinterest Official Trend Report ↗
        </a>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRENDS_DATA.map((trend, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-[#e8dbca] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f4ede2] text-[#7c5742]">
                  {trend.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {trend.growth}
                </span>
              </div>

              <h3 className="text-base font-bold font-serif text-[#2f1f1a]">
                {trend.keyword}
              </h3>

              <p className="text-xs text-[#553c30] leading-relaxed">
                {trend.description}
              </p>

              <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#e8dbca] space-y-1">
                <span className="text-[10px] font-bold text-[#9b7053] uppercase tracking-wider block">
                  Suggested High-CTR Title
                </span>
                <p className="text-xs font-semibold text-[#2f1f1a] font-serif">
                  "{trend.suggestedTitle}"
                </p>
              </div>

              <div className="text-[11px] text-[#7c5742]">
                <strong className="text-[#553c30]">Amazon Angle:</strong> {trend.amazonAngle}
              </div>
            </div>

            <Link
              href={`/generator?title=${encodeURIComponent(trend.suggestedTitle)}&category=${encodeURIComponent(trend.category)}`}
              className="w-full py-2.5 px-3 rounded-xl bg-[#f4ede2] hover:bg-[#e8dbca] text-[#2f1f1a] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9b7053]" />
              Generate Article on This Trend
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
