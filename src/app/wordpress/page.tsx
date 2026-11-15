'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, CheckCircle2, Clock, ExternalLink, Send, 
  Eye, ShieldCheck, RefreshCw, AlertCircle, Copy, Check, Sparkles, Trash2
} from 'lucide-react';
import { Article } from '@/types';
import { formatArticleForWordPress } from '@/lib/wordpress';

export default function WordPressPublisherPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'publish'>('draft');
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [copiedGutenberg, setCopiedGutenberg] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [featuredProvider, setFeaturedProvider] = useState('auto');
  const [featuredPrompt, setFeaturedPrompt] = useState('');
  const [featuredCrop, setFeaturedCrop] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center');
  const [featuredAction, setFeaturedAction] = useState(false);
  const [previewImageProviders, setPreviewImageProviders] = useState<Record<number, string>>({});
  const [previewImageActionIndex, setPreviewImageActionIndex] = useState<number | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success && data.articles.length > 0) {
        setArticles(data.articles);
        setActiveArticle(data.articles[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handlePublish = async () => {
    if (!activeArticle) return;
    setPublishing(true);
    setResult(null);

    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: activeArticle.id,
          publishStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          url: data.postUrl,
        });
        fetchArticles();
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to upload to WordPress',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Network error occurred',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!activeArticle) return;
    if (!window.confirm(`Delete "${activeArticle.title}" from the dashboard and remove its generated local images?`)) {
      return;
    }

    setDeleting(true);
    setResult(null);
    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeArticle.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete the article.');
      }

      const remainingArticles = articles.filter((article) => article.id !== activeArticle.id);
      setArticles(remainingArticles);
      setActiveArticle(remainingArticles[0] || null);
      setResult({
        success: true,
        message: `Article removed. ${data.deletedImages || 0} generated image(s) cleaned up locally.`,
      });
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Failed to delete the article.' });
    } finally {
      setDeleting(false);
    }
  };

  const saveArticleItem = async (index: number, itemUpdate: Partial<Article['items'][number]>) => {
    if (!activeArticle?.items?.[index]) return;
    const updatedArticle: Article = {
      ...activeArticle,
      items: activeArticle.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...itemUpdate } : item),
    };
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedArticle),
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Could not save the featured image.');
    setActiveArticle(updatedArticle);
    setArticles((current) => current.map((article) => article.id === updatedArticle.id ? updatedArticle : article));
  };

  const saveFeaturedArticle = (itemUpdate: Partial<Article['items'][number]>) => saveArticleItem(0, itemUpdate);

  const regenerateFeaturedImage = async () => {
    if (!activeArticle?.items?.[0]?.imageUrl) return;
    setFeaturedAction(true);
    setResult(null);
    try {
      const item = activeArticle.items[0];
      const response = await fetch('/api/images/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          customPrompt: featuredPrompt || item.imagePrompt || item.description,
          provider: featuredProvider,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Featured image generation failed.');
      await saveFeaturedArticle({
        imageUrl: data.imageUrl,
        imageAiProvider: data.imageAiProvider,
        imageAiModel: data.imageAiModel,
        imageCropPosition: featuredCrop,
      });
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Featured image generation failed.' });
    } finally {
      setFeaturedAction(false);
    }
  };

  const uploadFeaturedImage = async (file: File) => {
    setFeaturedAction(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('previousUrl', activeArticle?.items?.[0]?.imageUrl || '');
      const response = await fetch('/api/images/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Featured image upload failed.');
      await saveFeaturedArticle({
        imageUrl: data.imageUrl,
        imageAiProvider: data.imageAiProvider,
        imageAiModel: data.imageAiModel,
        imageCropPosition: featuredCrop,
      });
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Featured image upload failed.' });
    } finally {
      setFeaturedAction(false);
    }
  };

  const regeneratePreviewImage = async (index: number) => {
    if (!activeArticle?.items?.[index]?.imageUrl) return;
    setPreviewImageActionIndex(index);
    setResult(null);
    try {
      const item = activeArticle.items[index];
      const response = await fetch('/api/images/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          customPrompt: item.imagePrompt || item.description,
          provider: previewImageProviders[index] || 'auto',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Image generation failed.');
      await saveArticleItem(index, {
        imageUrl: data.imageUrl,
        imageAiProvider: data.imageAiProvider,
        imageAiModel: data.imageAiModel,
      });
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Image generation failed.' });
    } finally {
      setPreviewImageActionIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2f1f1a] flex items-center gap-2">
            <Globe className="w-7 h-7 text-[#9b7053]" />
            WordPress 1-Click Publisher
          </h1>
          <p className="text-xs sm:text-sm text-[#7c5742]">
            Send formatted listicles directly to <span className="font-semibold text-[#553c30]">cozyspace.company</span> via REST API with Gutenberg layout and Amazon compliance disclosures.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4ede2] border border-[#d7c1a8] text-xs font-semibold text-[#674738]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Connected: cozyspace.company (Astra Theme)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Article selection & controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e8dbca] shadow-sm space-y-3">
            <label className="text-xs font-bold text-[#7c5742] uppercase tracking-wider block">
              Choose Article to Publish
            </label>
            <div className="space-y-2">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setActiveArticle(art);
                    setResult(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeArticle?.id === art.id
                      ? 'border-[#9b7053] bg-[#faf7f2] shadow-sm'
                      : 'border-[#e8dbca] hover:bg-[#faf7f2]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f4ede2] text-[#9b7053]">
                      {art.category}
                    </span>
                    {art.wpPostId ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Live on WP (ID: {art.wpPostId})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Not Published
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold font-serif text-[#2f1f1a] line-clamp-2">
                    {art.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Publishing Mode Card */}
          {activeArticle && (
            <div className="bg-white p-5 rounded-2xl border border-[#e8dbca] shadow-sm space-y-4">
              <label className="text-xs font-bold text-[#7c5742] uppercase tracking-wider block">
                Publishing Options
              </label>

              {/* Featured Image Box */}
              {activeArticle.items?.[0]?.imageUrl && (
                <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#d7c1a8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#553c30] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#b28867]" />
                      WordPress Featured Image (الصورة البارزة)
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      Auto-Uploaded
                    </span>
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-[#e8dbca]">
                    <img
                      src={activeArticle.items[0].imageUrl}
                      alt="Featured Thumbnail"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: activeArticle.items[0].imageCropPosition || featuredCrop }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={activeArticle.items[0].imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-[#f4ede2] border border-[#d7c1a8] rounded-lg text-[11px] font-semibold text-center text-[#2f1f1a] transition-colors"
                    >
                      👁️ View / Download
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeArticle.items[0].imageUrl);
                      }}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-[#f4ede2] border border-[#d7c1a8] rounded-lg text-[11px] font-semibold text-[#2f1f1a] transition-colors"
                    >
                      🔗 Copy Image Link
                    </button>
                  </div>
                  <span className="text-[10px] text-[#7c5742]">
                    Image AI: {activeArticle.items[0].imageAiProvider || 'Original / not recorded'}
                    {activeArticle.items[0].imageAiModel ? ` · ${activeArticle.items[0].imageAiModel}` : ''}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#e8dbca]">
                    <select
                      value={featuredProvider}
                      onChange={(event) => setFeaturedProvider(event.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-[#d7c1a8] text-[10px] text-[#2f1f1a] bg-white"
                    >
                      <option value="auto">Auto fallback</option>
                      <option value="google">Google Gemini</option>
                      <option value="cloudflare">Cloudflare Workers AI</option>
                      <option value="huggingface">Hugging Face FLUX</option>
                      <option value="pollinations">Pollinations FLUX (free)</option>
                      <option value="recraft">Recraft via OpenRouter</option>
                    </select>
                    <select
                      value={featuredCrop}
                      onChange={(event) => {
                        const value = event.target.value as typeof featuredCrop;
                        setFeaturedCrop(value);
                        void saveFeaturedArticle({ imageCropPosition: value }).catch((error: any) => {
                          setResult({ success: false, message: error.message || 'Could not save crop position.' });
                        });
                      }}
                      className="px-2 py-1.5 rounded-lg border border-[#d7c1a8] text-[10px] text-[#2f1f1a] bg-white"
                    >
                      <option value="center">Crop: Center</option>
                      <option value="top">Crop: Top</option>
                      <option value="bottom">Crop: Bottom</option>
                      <option value="left">Crop: Left</option>
                      <option value="right">Crop: Right</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    value={featuredPrompt}
                    onChange={(event) => setFeaturedPrompt(event.target.value)}
                    placeholder="Modification prompt: warm daylight, cleaner composition, keep the same pantry theme..."
                    className="w-full px-2.5 py-2 rounded-lg border border-[#d7c1a8] text-[10px] text-[#2f1f1a] bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={regenerateFeaturedImage}
                      disabled={featuredAction}
                      className="py-2 rounded-lg bg-[#553c30] text-white text-[10px] font-bold disabled:opacity-50"
                    >
                      {featuredAction ? 'Working...' : 'Generate same-topic image'}
                    </button>
                    <label className="py-2 rounded-lg border border-[#d7c1a8] bg-white text-[#553c30] text-[10px] font-bold text-center cursor-pointer">
                      Upload replacement
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadFeaturedImage(file);
                          event.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPublishStatus('draft')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    publishStatus === 'draft'
                      ? 'border-[#9b7053] bg-[#f4ede2] font-bold text-[#2f1f1a]'
                      : 'border-[#e8dbca] text-xs text-[#7c5742]'
                  }`}
                >
                  <div className="text-xs font-bold">Save as Draft</div>
                  <div className="text-[10px] text-[#9b7053]">Safely review in WP admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPublishStatus('publish')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    publishStatus === 'publish'
                      ? 'border-[#9b7053] bg-[#f4ede2] font-bold text-[#2f1f1a]'
                      : 'border-[#e8dbca] text-xs text-[#7c5742]'
                  }`}
                >
                  <div className="text-xs font-bold">Publish Live</div>
                  <div className="text-[10px] text-[#9b7053]">Immediately viewable online</div>
                </button>
              </div>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#b28867] to-[#9b7053] hover:from-[#9b7053] hover:to-[#7c5742] text-white font-bold text-sm shadow-md shadow-[#9b7053]/25 flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {publishing ? 'Uploading to WordPress...' : `Upload to WordPress (${publishStatus.toUpperCase()})`}
              </button>

              <button
                type="button"
                onClick={handleDeleteArticle}
                disabled={deleting}
                className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Cleaning up...' : 'Delete & Cleanup Locally'}
              </button>

              {/* 1-Click Copy Gutenberg Blocks (100% Fail-Proof Backup) */}
              <div className="pt-2 border-t border-[#f4ede2] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#7c5742]">
                  <span className="font-bold">1-Click Manual Backup:</span>
                  <a 
                    href="https://cozyspace.company/wp-admin/post-new.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#9b7053] hover:text-[#553c30] font-semibold underline"
                  >
                    Open New Post in WP ↗
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const blockContent = formatArticleForWordPress(activeArticle);
                    navigator.clipboard.writeText(blockContent);
                    setCopiedGutenberg(true);
                    setTimeout(() => setCopiedGutenberg(false), 3000);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#faf7f2] hover:bg-[#f4ede2] border border-[#d7c1a8] text-[#2f1f1a] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedGutenberg ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied Gutenberg Blocks! (Just press Ctrl+V in WP)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#9b7053]" />
                      <span>Copy Full Gutenberg Post (Ctrl+C)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Response Alert */}
              {result && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium space-y-2 ${
                    result.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span>{result.message}</span>
                  </div>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold underline text-emerald-900 pt-1"
                    >
                      Open Live WordPress Post ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Real-time Gutenberg & Astra Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#e8dbca] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#f4ede2] pb-3">
            <span className="text-xs font-bold text-[#7c5742] uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#9b7053]" />
              WordPress Gutenberg Post Preview
            </span>
            <span className="text-xs text-[#9b7053] font-mono">
              Target: cozyspace.company
            </span>
          </div>

          {activeArticle ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2f1f1a] leading-tight">
                {activeArticle.title}
              </h1>
              <div className="text-[10px] text-[#7c5742]">
                Text AI: {activeArticle.textAiProvider || 'Not recorded'}
                {activeArticle.textAiModel ? ` · ${activeArticle.textAiModel}` : ''}
              </div>

              <div className="prose prose-stone max-w-none text-sm text-[#443329]">
                <div className="rounded-lg border-l-4 border-[#b28867] bg-[#f4ede2] p-4 text-sm leading-relaxed">
                  <strong>Transparency Disclosure:</strong> Some of the links below are affiliate links. As an Amazon Associate, CozySpace earns from qualifying purchases if you choose to buy through these links, at zero additional cost to you.
                </div>

                <p className="mt-8 text-[1.05rem] leading-[1.85] text-[#2f1f1a]">
                  {activeArticle.metaDescription}
                </p>

                {activeArticle.items.map((item, index) => (
                  <section key={item.id || index} className="mt-10">
                    <h2 className="mb-3 text-2xl font-bold text-[#553c30]">
                      {item.itemNumber || index + 1}. {item.title}
                    </h2>
                    {item.imageUrl && (
                      <div className="space-y-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full rounded-[10px] object-cover shadow-sm"
                          style={{ objectPosition: item.imageCropPosition || 'center' }}
                        />
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e8dbca] bg-[#faf7f2] p-2">
                          <select
                            value={previewImageProviders[index] || 'auto'}
                            onChange={(event) => setPreviewImageProviders({
                              ...previewImageProviders,
                              [index]: event.target.value,
                            })}
                            className="min-w-[150px] flex-1 rounded-lg border border-[#d7c1a8] bg-white px-2 py-1.5 text-[10px] text-[#2f1f1a]"
                            aria-label={`Image AI provider for preview image ${index + 1}`}
                          >
                            <option value="auto">Auto fallback</option>
                            <option value="google">Google Gemini</option>
                            <option value="cloudflare">Cloudflare Workers AI</option>
                            <option value="huggingface">Hugging Face FLUX</option>
                            <option value="pollinations">Pollinations FLUX (free)</option>
                            <option value="recraft">Recraft via OpenRouter</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => void regeneratePreviewImage(index)}
                            disabled={previewImageActionIndex !== null}
                            className="rounded-lg bg-[#553c30] px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-50"
                          >
                            {previewImageActionIndex === index ? 'Generating...' : 'Regenerate with AI'}
                          </button>
                          <span className="w-full text-[10px] text-[#7c5742]">
                            AI: {item.imageAiProvider || 'Original / not recorded'}
                            {item.imageAiModel ? ` · ${item.imageAiModel}` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="mt-4 leading-[1.85] text-[#443329]">{item.description}</p>
                    <a
                      href={item.directAmazonUrl || item.amazonSearchUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="mt-4 inline-flex rounded-full bg-[#ff9900] px-6 py-3 text-sm font-bold text-[#111] shadow-sm"
                    >
                      🛒 {item.ctaText || `Check Price on Amazon: ${item.amazonKeyword}`}
                    </a>
                    <hr className="my-9 border-0 border-t border-dashed border-[#d7c1a8]" />
                  </section>
                ))}

                <h3 className="mt-8 text-xl font-bold text-[#553c30]">Love These Cozy Ideas? Save This Pin!</h3>
                <p className="leading-[1.75] text-[#443329]">
                  Be sure to save this post to your favorite <strong>Home Decor & Cozy Living</strong> boards on Pinterest so you can always come back when you&apos;re ready to refresh your space!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#7c5742] text-xs">
              Select an article on the left to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
