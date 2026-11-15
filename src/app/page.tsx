'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Pin, Globe, ArrowRight, CheckCircle2, Clock, 
  ExternalLink, ShoppingBag, Eye, TrendingUp, ShieldCheck, RefreshCw, Trash2
} from 'lucide-react';
import { Article } from '@/types';
import { deleteClientArticle, loadMergedArticles, saveClientArticle } from '@/lib/client-article-storage';

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  const fetchArticles = async () => {
    try {
      setArticles(await loadMergedArticles());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleQuickPublish = async (articleId: string, status: 'draft' | 'publish') => {
    setPublishingId(articleId);
    setPublishMessage(null);
    try {
      const res = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          article: articles.find((item) => item.id === articleId),
          publishStatus: status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.article) await saveClientArticle(data.article);
        setPublishMessage({ id: articleId, text: data.message });
        fetchArticles();
      } else {
        setPublishMessage({ id: articleId, text: data.error, error: true });
      }
    } catch (err: any) {
      setPublishMessage({ id: articleId, text: err.message, error: true });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!window.confirm(`Delete "${article.title}" from the dashboard and remove its generated local images?`)) {
      return;
    }

    setDeletingId(article.id);
    setPublishMessage(null);
    try {
      const res = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete the article.');
      }
      await deleteClientArticle(article.id);

      setArticles((current) => current.filter((item) => item.id !== article.id));
    } catch (err: any) {
      setPublishMessage({ id: article.id, text: err.message, error: true });
    } finally {
      setDeletingId(null);
    }
  };

  const publishedCount = articles.filter((a) => a.status === 'published' || a.wpPostId).length;
  const totalItemsCount = articles.reduce((sum, a) => sum + (a.items?.length || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#553c30] via-[#7c5742] to-[#9b7053] p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-amber-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Pinterest + Amazon Affiliate Automation Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight leading-tight">
            CozySpace Growth Studio
          </h1>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            Create high-converting, aesthetic home decor listicles, generate Pinterest Pins with viral collage layouts, and publish directly to <span className="font-semibold underline decoration-amber-300">cozyspace.company</span> with 1-click.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#2f1f1a] font-bold text-sm shadow-lg shadow-black/10 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Create New Article
            </Link>
            <Link
              href="/pin-studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 transition-all"
            >
              <Pin className="w-4 h-4 text-amber-200" />
              Open Pin Studio
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#e8dbca] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c5742] uppercase tracking-wider">Total Articles</span>
            <span className="p-2 rounded-lg bg-amber-50 text-[#9b7053]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#2f1f1a] font-serif">{articles.length}</p>
          <p className="text-xs text-[#7c5742] mt-1">{totalItemsCount} curated products & photos</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#e8dbca] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c5742] uppercase tracking-wider">WordPress Published</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#2f1f1a] font-serif">{publishedCount}</p>
          <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Synced to cozyspace.company
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#e8dbca] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c5742] uppercase tracking-wider">Amazon Associate Tag</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-base font-bold font-mono text-[#2f1f1a] truncate">cozyplace04-20</p>
          <p className="text-xs text-[#7c5742] mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            FTC Disclosure Active
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#e8dbca] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c5742] uppercase tracking-wider">Pinterest Optimization</span>
            <span className="p-2 rounded-lg bg-red-50 text-[#E60023]">
              <Pin className="w-4 h-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#2f1f1a] font-serif">9:16 Ultra</p>
          <p className="text-xs text-[#7c5742] mt-1">Collage & High CTR Text Overlays</p>
        </div>
      </div>

      {/* Main Content: Articles & Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#2f1f1a]">Ready Articles & Listicles</h2>
            <p className="text-xs text-[#7c5742]">Review content, generate Pinterest pins, or publish directly to WordPress.</p>
          </div>
          <button 
            onClick={fetchArticles} 
            className="p-2 text-[#7c5742] hover:text-[#2f1f1a] rounded-lg hover:bg-[#f4ede2] transition-colors"
            title="Refresh articles"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Article Cards / Table */}
        {loading ? (
          <div className="p-12 text-center text-[#7c5742] bg-white rounded-2xl border border-[#e8dbca]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#9b7053] mb-2" />
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#d7c1a8] space-y-3">
            <Sparkles className="w-10 h-10 text-[#c3a384] mx-auto" />
            <h3 className="text-base font-semibold text-[#2f1f1a]">No articles created yet</h3>
            <p className="text-xs text-[#7c5742] max-w-sm mx-auto">
              Start by generating your first cozy home decor article with product ideas and AI-ready prompts.
            </p>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-[#e8dbca] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#f4ede2] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f4ede2] text-[#7c5742]">
                        {article.category || 'Home Decor'}
                      </span>
                      <span className="text-xs text-[#9b7053] font-medium">
                        {article.items?.length || 0} Products & Images
                      </span>
                      {article.wpPostId ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          On WordPress (ID: {article.wpPostId})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" />
                          Ready to Publish
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold font-serif text-[#2f1f1a] hover:text-[#9b7053] transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-[#7c5742]">
                      <span className="px-2 py-0.5 rounded bg-[#f4ede2]">
                        Text AI: {article.textAiProvider || 'Not recorded'}
                        {article.textAiModel ? ` · ${article.textAiModel}` : ''}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#f4ede2]">
                        Image AI: {article.items?.find((item) => item.imageAiProvider)?.imageAiProvider || 'Original / mixed'}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this article */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/pin-studio?articleId=${article.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#E60023] text-xs font-semibold transition-colors"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      Create Pins
                    </Link>

                    {article.wpPostUrl ? (
                      <a
                        href={article.wpPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live Post
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => handleQuickPublish(article.id, 'draft')}
                          disabled={publishingId === article.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4ede2] hover:bg-[#e8dbca] text-[#553c30] text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          {publishingId === article.id ? 'Publishing...' : 'Upload as Draft'}
                        </button>
                        <button
                          onClick={() => handleQuickPublish(article.id, 'publish')}
                          disabled={publishingId === article.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#b28867] hover:bg-[#9b7053] text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                          {publishingId === article.id ? 'Publishing...' : 'Publish Live'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteArticle(article)}
                      disabled={deletingId === article.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === article.id ? 'Cleaning...' : 'Delete & Cleanup'}
                    </button>
                  </div>
                </div>

                {/* Publish response alert if triggered */}
                {publishMessage && publishMessage.id === article.id && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
                      publishMessage.error
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <span>{publishMessage.text}</span>
                  </div>
                )}

                {/* Item thumbnails & Amazon tags preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
                  {article.items?.slice(0, 7).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="group relative rounded-xl overflow-hidden border border-[#e8dbca] bg-[#faf7f2] flex flex-col justify-between"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-[#e8dbca]/50 relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#9b7053] text-xs">
                            No image
                          </div>
                        )}
                        <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-[11px] font-semibold text-[#2f1f1a] truncate" title={item.title}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-[#7c5742] truncate" title={item.imageAiModel || item.imageAiProvider || 'Original image'}>
                          Image AI: {item.imageAiProvider || 'Original'}
                        </p>
                        <a
                          href={item.directAmazonUrl || item.amazonSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold block truncate"
                          title="Open Amazon Search with your tag"
                        >
                          🛒 Amazon Search ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance & Workflow Tips Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-xl bg-[#f4ede2] border border-[#d7c1a8] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7c5742] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Amazon Operating Agreement Safe
          </div>
          <p className="text-xs text-[#553c30] leading-relaxed">
            All Amazon links use <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">rel="nofollow sponsored"</code> and include the mandatory FTC transparency statement at the very top of each article.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#f4ede2] border border-[#d7c1a8] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7c5742] uppercase tracking-wider">
            <Pin className="w-4 h-4 text-[#E60023]" />
            Pinterest 9:16 Viral Design
          </div>
          <p className="text-xs text-[#553c30] leading-relaxed">
            Pinterest’s algorithm favors fresh vertical 9:16 Pins with high-contrast text overlays. Use the <strong>Pin Studio</strong> to render studio-quality pins in seconds.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#f4ede2] border border-[#d7c1a8] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7c5742] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-[#9b7053]" />
            Search & Stock Safe Links
          </div>
          <p className="text-xs text-[#553c30] leading-relaxed">
            Targeted search links (<code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">amazon.com/s?k=...</code>) never run out of stock and ensure the user always finds current best-sellers.
          </p>
        </div>
      </div>
    </div>
  );
}
