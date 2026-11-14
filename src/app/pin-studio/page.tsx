'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Pin, Download, Copy, Check, Sparkles, Image as ImageIcon, 
  Layers, Palette, Type, RefreshCw, Sliders 
} from 'lucide-react';
import { Article } from '@/types';

function PinStudioContent() {
  const searchParams = useSearchParams();
  const requestedArticleId = searchParams.get('articleId');

  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Pin customization states
  const [template, setTemplate] = useState<'hero' | 'split' | 'triple'>('hero');
  const [pinTitle, setPinTitle] = useState('10 Cozy Reading Nook Ideas You Will Obsess Over');
  const [pinSubtitle, setPinSubtitle] = useState('Aesthetic Amazon Home Finds Under $100');
  const [brandText, setBrandText] = useState('cozyspace.company');
  const [badgeColor, setBadgeColor] = useState('#faf7f2');
  const [textColor, setTextColor] = useState('#2f1f1a');
  const [accentColor, setAccentColor] = useState('#b28867');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load articles
  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.articles.length > 0) {
          setArticles(data.articles);
          const found = data.articles.find((a: Article) => a.id === requestedArticleId) || data.articles[0];
          setSelectedArticle(found);
          applyArticleData(found);
        }
      });
  }, [requestedArticleId]);

  const applyArticleData = (article: Article) => {
    setPinTitle(article.title);
    setPinSubtitle(`${article.items?.length || 10} Aesthetic Decor Pieces for a Warm Home`);
    const imgs = article.items?.map((i) => i.imageUrl).filter(Boolean) || [];
    setSelectedImages(imgs.length > 0 ? imgs : [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ]);
  };

  // Render Pin to Canvas whenever parameters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pinterest ideal vertical ratio: 1000 x 1500 (2:3 / 9:16 standard)
    const W = 1000;
    const H = 1500;
    canvas.width = W;
    canvas.height = H;

    // Background fill
    ctx.fillStyle = '#faf7f2';
    ctx.fillRect(0, 0, W, H);

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          // If image fails, create a placeholder canvas
          const fallback = new Image();
          resolve(fallback);
        };
        img.src = url;
      });
    };

    const drawHelper = async () => {
      const img1Url = selectedImages[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80';
      const img2Url = selectedImages[1] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80';
      const img3Url = selectedImages[2] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80';

      const [img1, img2, img3] = await Promise.all([
        loadImage(img1Url),
        loadImage(img2Url),
        loadImage(img3Url),
      ]);

      if (template === 'hero') {
        // Single Hero Image full height
        if (img1.complete && img1.naturalWidth) {
          ctx.drawImage(img1, 0, 0, W, H);
        } else {
          ctx.fillStyle = '#c3a384';
          ctx.fillRect(0, 0, W, H);
        }

        // Dark gradient vignette for readability
        const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
        grad.addColorStop(0, 'rgba(47, 31, 26, 0)');
        grad.addColorStop(1, 'rgba(47, 31, 26, 0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Center Rounded Luxury Badge
        const badgeW = W * 0.86;
        const badgeH = 460;
        const badgeX = (W - badgeW) / 2;
        const badgeY = H - badgeH - 120;

        // Shadow for badge
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;

        // Draw rounded rectangle badge
        ctx.fillStyle = badgeColor;
        drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 28);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Tag / Subtitle ribbon
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 24px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pinSubtitle.toUpperCase(), W / 2, badgeY + 68);

        // Main Title (Wrapped)
        ctx.fillStyle = textColor;
        ctx.font = 'bold 52px "Playfair Display", Georgia, serif';
        wrapText(ctx, pinTitle, W / 2, badgeY + 145, badgeW - 80, 64);

        // Star rating & Call to action
        ctx.fillStyle = '#FF9900';
        ctx.font = '28px sans-serif';
        ctx.fillText('★★★★★  Cozy Home Approved', W / 2, badgeY + badgeH - 95);

        // Read More Button pill
        ctx.fillStyle = accentColor;
        drawRoundRect(ctx, W / 2 - 170, badgeY + badgeH - 60, 340, 48, 24);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.fillText('READ THE ARTICLE →', W / 2, badgeY + badgeH - 28);

        // Brand footer bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 22px -apple-system, sans-serif';
        ctx.fillText(brandText.toUpperCase(), W / 2, H - 45);

      } else if (template === 'split') {
        // 2-Photo Split Collage
        const halfH = H / 2;
        if (img1.complete && img1.naturalWidth) {
          ctx.drawImage(img1, 0, 0, W, halfH - 10);
        }
        if (img2.complete && img2.naturalWidth) {
          ctx.drawImage(img2, 0, halfH + 10, W, halfH - 10);
        }

        // Center floating card
        const cardW = W * 0.88;
        const cardH = 340;
        const cardX = (W - cardW) / 2;
        const cardY = (H - cardH) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = badgeColor;
        drawRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Badge content
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 22px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pinSubtitle.toUpperCase(), W / 2, cardY + 60);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 48px Georgia, serif';
        wrapText(ctx, pinTitle, W / 2, cardY + 130, cardW - 60, 58);

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.fillText(`tap for cozy ideas • ${brandText}`, W / 2, cardY + cardH - 45);

      } else {
        // Triple Collage (1 big on top, 2 side-by-side on bottom)
        const topH = 880;
        const botH = H - topH - 20;
        const halfW = (W - 20) / 2;

        if (img1.complete && img1.naturalWidth) {
          ctx.drawImage(img1, 0, 0, W, topH);
        }
        if (img2.complete && img2.naturalWidth) {
          ctx.drawImage(img2, 0, topH + 20, halfW, botH);
        }
        if (img3.complete && img3.naturalWidth) {
          ctx.drawImage(img3, halfW + 20, topH + 20, halfW, botH);
        }

        // Top banner banner
        const banH = 280;
        ctx.fillStyle = 'rgba(250, 247, 242, 0.95)';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 20;
        drawRoundRect(ctx, 40, 50, W - 80, banH, 24);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOT ON PINTEREST • AMAZON FINDS', W / 2, 105);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 46px Georgia, serif';
        wrapText(ctx, pinTitle, W / 2, 170, W - 140, 54);

        ctx.fillStyle = '#674738';
        ctx.font = 'bold 18px -apple-system, sans-serif';
        ctx.fillText(brandText, W / 2, 290);
      }
    };

    drawHelper();
  }, [template, pinTitle, pinSubtitle, brandText, badgeColor, textColor, accentColor, selectedImages]);

  // Helper: rounded rectangle
  function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Helper: multi-line text wrapper
  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  const downloadPin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `cozyspace-pin-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = (text: string, type: 'title' | 'desc') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const seoPinDescription = `${pinTitle} ☕✨ Transform your home with these aesthetic, cozy decor ideas and affordable Amazon finds! Read the full shopping guide and shop the look at cozyspace.company.\n\n#cozyhome #readingnook #amazonhome #homedecorideas #aestheticroom #cozyvibes #apartmentdecor #livingroomdecor`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2f1f1a] flex items-center gap-2">
            <Pin className="w-7 h-7 text-[#E60023]" />
            Pinterest Pin Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#7c5742]">
            Render viral 9:16 high-resolution Pins with eye-catching collage layouts and CTR-boosting titles.
          </p>
        </div>

        {/* Article Selector */}
        {articles.length > 0 && (
          <select
            value={selectedArticle?.id || ''}
            onChange={(e) => {
              const a = articles.find((art) => art.id === e.target.value);
              if (a) {
                setSelectedArticle(a);
                applyArticleData(a);
              }
            }}
            className="px-3 py-2 bg-white border border-[#d7c1a8] rounded-xl text-xs font-semibold text-[#2f1f1a] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
          >
            {articles.map((a) => (
              <option key={a.id} value={a.id}>
                Article: {a.title.slice(0, 45)}...
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-2xl border border-[#e8dbca] shadow-sm">
          {/* Template Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7c5742] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#9b7053]" />
              Pin Layout Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTemplate('hero')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  template === 'hero'
                    ? 'border-[#9b7053] bg-[#f4ede2] font-bold text-[#2f1f1a]'
                    : 'border-[#e8dbca] hover:bg-[#faf7f2] text-xs text-[#7c5742]'
                }`}
              >
                <div className="text-xs font-semibold">Hero Badge</div>
                <div className="text-[10px] text-[#9b7053]">High CTR Card</div>
              </button>
              <button
                onClick={() => setTemplate('split')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  template === 'split'
                    ? 'border-[#9b7053] bg-[#f4ede2] font-bold text-[#2f1f1a]'
                    : 'border-[#e8dbca] hover:bg-[#faf7f2] text-xs text-[#7c5742]'
                }`}
              >
                <div className="text-xs font-semibold">Split Duo</div>
                <div className="text-[10px] text-[#9b7053]">2-Image Split</div>
              </button>
              <button
                onClick={() => setTemplate('triple')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  template === 'triple'
                    ? 'border-[#9b7053] bg-[#f4ede2] font-bold text-[#2f1f1a]'
                    : 'border-[#e8dbca] hover:bg-[#faf7f2] text-xs text-[#7c5742]'
                }`}
              >
                <div className="text-xs font-semibold">Triple Grid</div>
                <div className="text-[10px] text-[#9b7053]">Moodboard</div>
              </button>
            </div>
          </div>

          {/* Texts */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#7c5742] block mb-1">
                Pin Overlay Headline
              </label>
              <textarea
                rows={2}
                value={pinTitle}
                onChange={(e) => setPinTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs font-serif font-bold text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#7c5742] block mb-1">
                Sub-Headline / Hook
              </label>
              <input
                type="text"
                value={pinSubtitle}
                onChange={(e) => setPinSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#7c5742] block mb-1">
                Brand / Website Watermark
              </label>
              <input
                type="text"
                value={brandText}
                onChange={(e) => setBrandText(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs font-mono text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7c5742] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#9b7053]" />
              Palette & Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setBadgeColor('#faf7f2');
                  setTextColor('#2f1f1a');
                  setAccentColor('#b28867');
                }}
                className="p-2 rounded-lg bg-[#faf7f2] border border-[#d7c1a8] text-[11px] font-semibold text-[#553c30]"
              >
                Cream & Boucle
              </button>
              <button
                onClick={() => {
                  setBadgeColor('#2f1f1a');
                  setTextColor('#faf7f2');
                  setAccentColor('#d7c1a8');
                }}
                className="p-2 rounded-lg bg-[#2f1f1a] text-white border border-[#553c30] text-[11px] font-semibold"
              >
                Dark Espresso
              </button>
              <button
                onClick={() => {
                  setBadgeColor('#fdfbf7');
                  setTextColor('#1e392a');
                  setAccentColor('#3d6647');
                }}
                className="p-2 rounded-lg bg-[#edf4ee] border border-[#c2d6c6] text-[11px] font-semibold text-[#1e392a]"
              >
                Sage Green
              </button>
            </div>
          </div>

          {/* Download Action */}
          <div className="pt-2">
            <button
              onClick={downloadPin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E60023] to-[#ad081b] hover:from-[#c7001f] hover:to-[#910616] text-white font-bold text-sm shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <Download className="w-4 h-4" />
              Download High-Res 9:16 Pin (PNG)
            </button>
          </div>

          {/* Pinterest SEO Copy helpers */}
          <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#e8dbca] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7c5742]">Pinterest SEO Title</span>
              <button
                onClick={() => copyToClipboard(pinTitle, 'title')}
                className="text-[11px] text-[#9b7053] hover:text-[#553c30] font-semibold flex items-center gap-1"
              >
                {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTitle ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-[#2f1f1a] font-serif font-bold bg-white p-2 rounded-lg border border-[#e8dbca]">
              {pinTitle}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-[#7c5742]">Pinterest SEO Description & Tags</span>
              <button
                onClick={() => copyToClipboard(seoPinDescription, 'desc')}
                className="text-[11px] text-[#9b7053] hover:text-[#553c30] font-semibold flex items-center gap-1"
              >
                {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDesc ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-[#553c30] bg-white p-2 rounded-lg border border-[#e8dbca] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
              {seoPinDescription}
            </p>
          </div>
        </div>

        {/* Right: Live Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black/5 max-w-[420px] w-full">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              style={{ aspectRatio: '2 / 3' }}
            />
          </div>
          <span className="text-xs text-[#7c5742] font-mono">
            Output Size: 1000 × 1500px • 9:16 Pinterest Standard
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PinStudioPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#7c5742] text-xs">Loading Pinterest Studio...</div>}>
      <PinStudioContent />
    </Suspense>
  );
}
