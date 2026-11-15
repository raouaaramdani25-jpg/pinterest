'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Plus, Trash2, Save, ShoppingBag, Globe, 
  Image as ImageIcon, RefreshCw, CheckCircle2, ArrowRight, Upload
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
  
  // Importer states (URL & Text)
  const [importMode, setImportMode] = useState<'url' | 'text'>('url');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccessMsg, setScrapeSuccessMsg] = useState<string | null>(null);
  const [rewriteProvider, setRewriteProvider] = useState('gemini');
  const [imageProviders, setImageProviders] = useState<Record<number, string>>({});
  const [imageActionIndex, setImageActionIndex] = useState<number | null>(null);

  const handleScrapeRewriteUrl = async () => {
    if (!competitorUrl.trim() || !competitorUrl.startsWith('http')) {
      setScrapeError('Please enter a valid website URL starting with https:// or http://');
      return;
    }

    setScraping(true);
    setScrapeError(null);
    setScrapeSuccessMsg(null);
    setScrapeStatus('1/4 Connecting to competitor website & reading content...');

    try {
      const res = await fetch('/api/articles/scrape-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: competitorUrl.trim(),
          rewriteProvider,
        }),
      });

      const data = await res.json();

      if (data.success && data.article) {
        setScrapeStatus('2/4 Rewriting into aesthetic Cozy listicle...');
        if (data.article.title) setTopic(data.article.title);
        if (data.article.category) setCategory(data.article.category);
        if (data.article.metaDescription) setMetaDescription(data.article.metaDescription);
        if (data.article.items?.length > 0) setItems(data.article.items);

        const saveRes = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.article),
        });
        const saveData = await saveRes.json();

        if (!saveRes.ok || !saveData.success) {
          throw new Error(saveData.error || 'The rewritten article could not be saved.');
        }

        setScrapeSuccessMsg(
          `${data.message || `Successfully rewritten into ${data.itemsCount} cozy items with Amazon links & images!`} Saved to Articles & Studio.`
        );
        if (Array.isArray(data.imageErrors) && data.imageErrors.length > 0) {
          setScrapeError(`Some images could not be regenerated: ${data.imageErrors.join(' | ')}`);
        }
        setScrapeStatus('');
      } else {
        setScrapeError(data.error || 'Failed to scrape and rewrite the article.');
        setScrapeStatus('');
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Network error occurred while fetching the URL.');
      setScrapeStatus('');
    } finally {
      setScraping(false);
    }
  };

  const handleImportText = async () => {
    if (!rawInput.trim()) return;
    setScraping(true);
    setScrapeError(null);
    setScrapeSuccessMsg(null);
    try {
      const res = await fetch('/api/articles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawInput }),
      });
      const data = await res.json();
      if (data.success && data.article) {
        if (data.article.title) setTopic(data.article.title);
        if (data.article.category) setCategory(data.article.category);
        if (data.article.items?.length > 0) setItems(data.article.items);
        setScrapeSuccessMsg('Text successfully converted into structured items with Amazon search links!');
      } else {
        setScrapeError(data.error || 'Failed to process pasted text.');
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Error processing text');
    } finally {
      setScraping(false);
    }
  };

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

  const updateGeneratedImage = async (index: number) => {
    const item = items[index];
    if (!item?.imageUrl) return;
    setImageActionIndex(index);
    try {
      const response = await fetch('/api/images/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          customPrompt: item.imagePrompt,
          provider: imageProviders[index] || 'auto',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Image generation failed.');
      const nextItems = [...items];
      nextItems[index] = {
        ...item,
        imageUrl: data.imageUrl,
        imageAiProvider: data.imageAiProvider,
        imageAiModel: data.imageAiModel,
      };
      setItems(nextItems);
    } catch (error: any) {
      setScrapeError(error.message || 'Image generation failed.');
    } finally {
      setImageActionIndex(null);
    }
  };

  const uploadReplacementImage = async (index: number, file: File) => {
    setImageActionIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('previousUrl', items[index]?.imageUrl || '');
      const response = await fetch('/api/images/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Image upload failed.');
      const nextItems = [...items];
      nextItems[index] = {
        ...nextItems[index],
        imageUrl: data.imageUrl,
        imageAiProvider: data.imageAiProvider,
        imageAiModel: data.imageAiModel,
      };
      setItems(nextItems);
    } catch (error: any) {
      setScrapeError(error.message || 'Image upload failed.');
    } finally {
      setImageActionIndex(null);
    }
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

      {/* Competitor URL Scraper & AI Rewriter */}
      <div className="bg-gradient-to-r from-[#f4ede2] via-[#faf7f2] to-[#f4ede2] p-6 rounded-2xl border-2 border-[#b28867]/50 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8dbca] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#b28867] text-white text-[11px] font-bold tracking-wider uppercase">
              AI Powered
            </span>
            <h2 className="text-sm font-bold font-serif text-[#2f1f1a]">
              Competitor Article Scraper & Cozy AI Rewriter
            </h2>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-[#553c30]">
            <span>Rewrite AI:</span>
            <select
              value={rewriteProvider}
              onChange={(e) => setRewriteProvider(e.target.value)}
              className="rounded-lg border border-[#d7c1a8] bg-white px-2.5 py-1.5 text-xs text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
              aria-label="Article rewrite AI provider"
            >
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq</option>
              <option value="cerebras">Cerebras</option>
              <option value="cloudflare">Cloudflare Workers AI</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </label>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#e8dbca]/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setImportMode('url')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                importMode === 'url'
                  ? 'bg-white text-[#2f1f1a] shadow-sm'
                  : 'text-[#7c5742] hover:text-[#2f1f1a]'
              }`}
            >
              🔗 Paste Article Link (URL)
            </button>
            <button
              type="button"
              onClick={() => setImportMode('text')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                importMode === 'text'
                  ? 'bg-white text-[#2f1f1a] shadow-sm'
                  : 'text-[#7c5742] hover:text-[#2f1f1a]'
              }`}
            >
              📝 Paste Text
            </button>
          </div>
        </div>

        {importMode === 'url' ? (
          <div className="space-y-3">
            <p className="text-xs text-[#553c30]">
              حط هنا <strong>الرابط (URL)</strong> ديال أي مقال من موقع منافس (مثلاً The Spruce، Apartment Therapy، أو أي بلوغ). السيستيم كيقراه كامل، كيعاود يصيغو بأسلوب CozySpace جذاب، كيولد ليه تصاور جمالية، وكيركب روابط أمازون بالتاغ ديالك (<code className="font-mono font-bold text-amber-800">cozyplace04-20</code>) أوتوماتيكياً!
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://www.thespruce.com/cozy-bedroom-ideas-..."
                className="flex-1 px-4 py-3 bg-white border border-[#d7c1a8] rounded-xl text-xs text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053] placeholder:text-[#a89078] font-mono"
              />
              <button
                type="button"
                onClick={handleScrapeRewriteUrl}
                disabled={scraping || !competitorUrl.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b28867] to-[#9b7053] hover:from-[#9b7053] hover:to-[#7c5742] text-white text-xs font-bold shadow-md shadow-[#9b7053]/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                {scraping ? 'Scraping & Rewriting...' : '✨ Scrape, AI-Rewrite & Add Amazon Links'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[#553c30]">
              حط هنا المقال ديالك أو نص منسوخ من أي بلاصة، والسيستيم غادي يقسمو لـ فقرات ويركب فيه أزرار أمازون فوراً:
            </p>
            <textarea
              rows={4}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste article paragraphs here..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#d7c1a8] rounded-xl text-xs text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
            />
            <button
              type="button"
              onClick={handleImportText}
              disabled={scraping || !rawInput.trim()}
              className="px-4 py-2 rounded-xl bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Convert Text to Listicle
            </button>
          </div>
        )}

        {/* Status indicator while scraping */}
        {scraping && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-700 flex-shrink-0" />
            <span className="font-medium">{scrapeStatus || 'Processing... Please wait a few seconds.'}</span>
          </div>
        )}

        {/* Success message */}
        {scrapeSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{scrapeSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setScrapeSuccessMsg(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error message */}
        {scrapeError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
            <span>{scrapeError}</span>
            <button 
              onClick={() => setScrapeError(null)}
              className="text-xs text-red-700 hover:text-red-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
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
                  <div className="text-[10px] text-[#7c5742]">
                    <strong>Image AI:</strong> {item.imageAiProvider || 'Original / not recorded'}
                    {item.imageAiModel ? ` · ${item.imageAiModel}` : ''}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={imageProviders[idx] || 'auto'}
                      onChange={(event) => setImageProviders({ ...imageProviders, [idx]: event.target.value })}
                      className="min-w-0 flex-1 px-2 py-1.5 text-[10px] bg-white border border-[#d7c1a8] rounded-lg text-[#2f1f1a]"
                      aria-label={`Image AI provider for item ${idx + 1}`}
                    >
                      <option value="auto">Auto fallback</option>
                      <option value="google">Google Gemini</option>
                      <option value="cloudflare">Cloudflare Workers AI</option>
                      <option value="recraft">Recraft via OpenRouter</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => updateGeneratedImage(idx)}
                      disabled={imageActionIndex !== null}
                      className="px-2 py-1.5 rounded-lg bg-[#553c30] text-white text-[10px] font-bold disabled:opacity-50"
                    >
                      {imageActionIndex === idx ? '...' : 'Generate'}
                    </button>
                    <label className="px-2 py-1.5 rounded-lg border border-[#d7c1a8] bg-white text-[10px] font-bold text-[#553c30] cursor-pointer">
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadReplacementImage(idx, file);
                          event.currentTarget.value = '';
                        }}
                      />
                    </label>
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
                  <div className="text-[10px] text-[#7c5742]">
                    <strong>Text AI:</strong> {item.textAiProvider || 'Not recorded'}
                    {item.textAiModel ? ` · ${item.textAiModel}` : ''}
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
