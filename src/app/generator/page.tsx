'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Plus, Trash2, Save, ShoppingBag, Globe, 
  Image as ImageIcon, RefreshCw, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { Article, ArticleItem } from '@/types';
import { buildAmazonSearchUrl } from '@/lib/amazon';

const PRESET_TOPICS = [
  {
    title: '10 Cozy Reading Nook Ideas That Will Make You Never Want to Leave',
    category: 'Home Decor',
    keyword: 'reading nook',
  },
  {
    title: '12 Aesthetic Coffee Station Ideas for Small Kitchens',
    category: 'Kitchen & Dining',
    keyword: 'coffee bar station',
  },
  {
    title: '8 Cozy Boho Balcony Ideas to Turn Small Spaces into an Oasis',
    category: 'Outdoor & Patio',
    keyword: 'boho balcony decor',
  },
  {
    title: '9 Warm Minimalist Bedroom Ideas for Better Sleep & Cozy Vibes',
    category: 'Bedroom Decor',
    keyword: 'warm minimalist bedroom',
  },
  {
    title: '11 Aesthetic Living Room Organization Hacks Under $50 on Amazon',
    category: 'Home Organization',
    keyword: 'living room organization',
  },
];

export default function ArticleGeneratorPage() {
  const router = useRouter();

  const [topic, setTopic] = useState(PRESET_TOPICS[0].title);
  const [category, setCategory] = useState(PRESET_TOPICS[0].category);
  const [metaDescription, setMetaDescription] = useState(
    'Discover aesthetic, cozy decor ideas and must-have Amazon finds to elevate your home comfort.'
  );
  const [items, setItems] = useState<ArticleItem[]>([
    {
      id: 'item-1',
      itemNumber: 1,
      title: 'Plush Bouclé Swivel Accent Chair',
      description: 'A creamy, cloud-textured bouclé chair creates an instantly welcoming corner for reading or resting.',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Cozy cream boucle chair beside a sunny window with a soft knitted throw',
      amazonKeyword: 'boucle swivel accent chair cream',
      amazonSearchUrl: buildAmazonSearchUrl('boucle swivel accent chair cream'),
      ctaText: 'Shop Bouclé Accent Chairs on Amazon',
      estimatedPrice: '$190',
    },
    {
      id: 'item-2',
      itemNumber: 2,
      title: 'Warm Arc Floor Lamp with Linen Shade',
      description: 'Replace harsh overhead lighting with a gentle downward warm glow that sets a calm, cozy evening mood.',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Brass arched floor lamp with warm glow over a comfortable armchair, cozy evening vibe',
      amazonKeyword: 'brass arc floor lamp warm lighting',
      amazonSearchUrl: buildAmazonSearchUrl('brass arc floor lamp warm lighting'),
      ctaText: 'Check Arc Lamps on Amazon',
      estimatedPrice: '$55',
    },
    {
      id: 'item-3',
      itemNumber: 3,
      title: 'Chunky Handwoven Chenille Throw Blanket',
      description: 'Layering tactile textures is the key to that warm Pinterest look. Chenille knit provides warmth without excess bulk.',
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Oversized beige chunky knit blanket draped over a linen chair with a ceramic coffee mug',
      amazonKeyword: 'chunky knit throw blanket beige',
      amazonSearchUrl: buildAmazonSearchUrl('chunky knit throw blanket beige'),
      ctaText: 'View Chunky Throws on Amazon',
      estimatedPrice: '$42',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePresetSelect = (preset: typeof PRESET_TOPICS[0]) => {
    setTopic(preset.title);
    setCategory(preset.category);
  };

  const addItem = () => {
    const nextNum = items.length + 1;
    const defaultKeyword = 'cozy home decor';
    const newItem: ArticleItem = {
      id: `item-${Date.now()}`,
      itemNumber: nextNum,
      title: `Cozy Essential #${nextNum}`,
      description: 'Describe why this item elevates the room ambiance and how it fits into a warm home aesthetic.',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      imagePrompt: 'Aesthetic cozy room detail with warm natural light',
      amazonKeyword: defaultKeyword,
      amazonSearchUrl: buildAmazonSearchUrl(defaultKeyword),
      ctaText: 'Check Price on Amazon',
      estimatedPrice: '$35',
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof ArticleItem, value: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    if (field === 'amazonKeyword') {
      copy[index].amazonSearchUrl = buildAmazonSearchUrl(value);
    }
    setItems(copy);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveArticle = async () => {
    setSaving(true);
    const newArticle: Article = {
      id: `article-${Date.now()}`,
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: topic,
      metaDescription,
      category,
      tags: ['Cozy Decor', 'Amazon Home', 'Aesthetic Room', category],
      items,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2f1f1a] flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#9b7053]" />
            Article & Listicle Creator
          </h1>
          <p className="text-xs sm:text-sm text-[#7c5742]">
            Build high-converting Pinterest-ready listicles with automatic Amazon Affiliate buttons and disclosures.
          </p>
        </div>

        <button
          onClick={handleSaveArticle}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b28867] hover:bg-[#9b7053] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              Saved! Redirecting...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save to Articles & Studio'}
            </>
          )}
        </button>
      </div>

      {/* Preset Topics */}
      <div className="bg-white p-5 rounded-2xl border border-[#e8dbca] space-y-2">
        <label className="text-xs font-bold text-[#7c5742] uppercase tracking-wider block">
          Trending Pinterest Inspiration
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_TOPICS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(p)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#e8dbca] bg-[#faf7f2] hover:bg-[#f4ede2] text-[#553c30] font-medium transition-colors"
            >
              + {p.title.slice(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Article Meta */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8dbca] shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[#7c5742]">Article Title (H1)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-sm font-serif font-bold text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#7c5742]">WordPress Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-sm text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#7c5742]">Intro / SEO Meta Description</label>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
          />
        </div>
      </div>

      {/* Listicle Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-[#2f1f1a]">
            Listicle Items ({items.length} Curated Ideas)
          </h2>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f4ede2] hover:bg-[#e8dbca] text-[#553c30] text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4 text-[#9b7053]" />
            Add New Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-[#e8dbca] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#f4ede2] pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f4ede2] text-[#9b7053]">
                  Item #{idx + 1}
                </span>
                <button
                  onClick={() => removeItem(idx)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Image preview & URL input (4 cols) */}
                <div className="md:col-span-4 space-y-2">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#f4ede2] border border-[#e8dbca] relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#7c5742]">
                        Paste image URL below
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Image URL..."
                    value={item.imageUrl}
                    onChange={(e) => updateItem(idx, 'imageUrl', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-[#faf7f2] border border-[#d7c1a8] rounded-lg text-[#2f1f1a] font-mono"
                  />
                  <div className="text-[10px] text-[#7c5742]">
                    <strong>AI Prompt:</strong> {item.imagePrompt}
                  </div>
                </div>

                {/* Content & Amazon fields (8 cols) */}
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#7c5742] block mb-1">Item Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs font-bold text-[#2f1f1a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#7c5742] block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs text-[#2f1f1a]"
                    />
                  </div>

                  {/* Amazon link settings */}
                  <div className="p-3.5 rounded-xl bg-[#fff9ee] border border-[#fed7aa] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9a3412] flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#ea580c]" />
                        Amazon Affiliate Link
                      </span>
                      <span className="text-[10px] font-mono text-[#c2410c]">Tag: cozyplace04-20</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#7c5742] block">Amazon Search Keyword</label>
                        <input
                          type="text"
                          value={item.amazonKeyword}
                          onChange={(e) => updateItem(idx, 'amazonKeyword', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#fed7aa] rounded-lg text-xs font-semibold text-[#2f1f1a]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#7c5742] block">Button Text (CTA)</label>
                        <input
                          type="text"
                          value={item.ctaText}
                          onChange={(e) => updateItem(idx, 'ctaText', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#fed7aa] rounded-lg text-xs text-[#2f1f1a]"
                        />
                      </div>
                    </div>

                    <a
                      href={item.directAmazonUrl || item.amazonSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1"
                    >
                      🔗 Preview Affiliate Link ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
