import { NextResponse } from 'next/server';
import { buildAmazonSearchUrl, DEFAULT_AMAZON_TAG } from '@/lib/amazon';
import { matchCozyImage } from '@/lib/image-matcher';
import { Article, ArticleItem } from '@/types';
import fs from 'fs';
import path from 'path';

// Clean raw HTML to plain text
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract meta tag or title
function extractTagContent(html: string, regex: RegExp): string {
  const match = html.match(regex);
  return match && match[1] ? stripHtml(match[1]) : '';
}

// Smart Cozy Text Rewriter
function rewriteToCozyTone(itemTitle: string, rawDesc: string): string {
  const cleanTitle = itemTitle.replace(/^[\d\.\s#\-]+/, '').trim();
  
  const intros = [
    `Adding a ${cleanTitle.toLowerCase()} brings an instant layer of organic warmth to any room.`,
    `Nothing elevates a space faster than a well-chosen ${cleanTitle.toLowerCase()}.`,
    `A gorgeous ${cleanTitle.toLowerCase()} acts as both a functional staple and a visual centerpiece.`,
    `To achieve that relaxed, magazine-worthy ambiance, incorporating a ${cleanTitle.toLowerCase()} is essential.`,
    `The beauty of styling with a ${cleanTitle.toLowerCase()} lies in its effortless tactile richness.`,
  ];
  
  const stylingTips = [
    `Style it alongside soft textured throws, ambient warm lighting, and a stack of your favorite coffee table books to complete the look.`,
    `Pair it with earthy ceramics and neutral tones to create a serene sanctuary you'll look forward to coming home to every single day.`,
    `It bridges the gap between everyday practicality and relaxed luxury, making small spaces feel curated rather than cluttered.`,
    `Opt for warm undertones like cream, oatmeal, or muted wood finishes to maximize that cozy, inviting atmosphere.`,
  ];

  const randomIntro = intros[Math.floor(Math.random() * intros.length)];
  const randomTip = stylingTips[Math.floor(Math.random() * stylingTips.length)];
  
  let core = rawDesc ? stripHtml(rawDesc).slice(0, 250) : '';
  if (core && !core.endsWith('.')) core += '.';

  return `${randomIntro} ${core} ${randomTip}`.replace(/\s+/g, ' ').trim();
}

export async function POST(req: Request) {
  try {
    const { url, amazonTag = DEFAULT_AMAZON_TAG } = await req.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid website URL.' }, { status: 400 });
    }

    // 1. Fetch competitor webpage
    let html = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `Failed to fetch URL: HTTP ${response.status} (${response.statusText}).`,
        }, { status: 400 });
      }

      html = await response.text();
    } catch (fetchErr: any) {
      return NextResponse.json({
        success: false,
        error: `Could not connect to URL: ${fetchErr.message}. Make sure the link is publicly accessible.`,
      }, { status: 400 });
    }

    // 2. Extract Title and Meta Description
    let originalTitle = 
      extractTagContent(html, /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      extractTagContent(html, /<title[^>]*>([^<]+)<\/title>/i) ||
      extractTagContent(html, /<h1[^>]*>([^<]+)<\/h1>/i) ||
      'Cozy Home Decor Ideas';

    // Remove site suffixes like " | The Spruce" or " - Architectural Digest"
    originalTitle = originalTitle.split(/[|\-–—]/)[0].trim();

    const originalDesc = 
      extractTagContent(html, /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      extractTagContent(html, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      '';

    // 3. Extract Headings and Items
    // Search for h2 or h3 patterns common in listicles
    const headingMatches: { title: string; desc: string }[] = [];
    const headingRegex = /<(h[23])[^>]*>([\s\S]*?)<\/\1>/gi;
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      const rawHeading = stripHtml(match[2]);
      // Filter out navigation or irrelevant headings
      if (
        rawHeading.length > 3 &&
        rawHeading.length < 120 &&
        !/subscribe|comment|related|newsletter|share|popular|footer|sidebar|author|menu/i.test(rawHeading)
      ) {
        // Try to get paragraph following this heading
        const followingHtml = html.slice(match.index + match[0].length, match.index + match[0].length + 1200);
        const pMatch = followingHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        const descText = pMatch ? stripHtml(pMatch[1]) : '';

        headingMatches.push({
          title: rawHeading,
          desc: descText,
        });
      }
    }

    // Filter items: prefer items that look like list items or decor pieces
    let itemsToProcess = headingMatches.slice(0, 12);
    if (itemsToProcess.length < 3) {
      // Fallback: look for numbered list items <li> or strong tags
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      const liMatches: { title: string; desc: string }[] = [];
      let liMatch;
      while ((liMatch = liRegex.exec(html)) !== null && liMatches.length < 10) {
        const text = stripHtml(liMatch[1]);
        if (text.length > 25 && text.length < 300) {
          const parts = text.split(/[:–—]/);
          liMatches.push({
            title: parts[0].trim(),
            desc: parts[1] ? parts.slice(1).join(' ').trim() : text,
          });
        }
      }
      if (liMatches.length >= 3) {
        itemsToProcess = liMatches;
      }
    }

    // 4. Construct Rewritten Listicle Items with Amazon Links & Aesthetic Images
    const rewrittenItems: ArticleItem[] = itemsToProcess.map((item, idx) => {
      const cleanTitle = item.title.replace(/^[\d\.\s#\-]+/, '').trim();
      const rewrittenDescription = rewriteToCozyTone(cleanTitle, item.desc);
      
      // Match aesthetic AI image (Flux Model) and Midjourney/Gemini prompt
      const imageMatch = matchCozyImage(cleanTitle, item.desc, idx);

      // Clean Amazon search keyword (remove quotes and noise words)
      const amazonKeyword = cleanTitle
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .slice(0, 45) || 'cozy home decor';

      const amazonSearchUrl = buildAmazonSearchUrl(amazonKeyword, amazonTag);
      const ctaText = `Shop ${cleanTitle.slice(0, 30)} on Amazon`;

      return {
        id: `scraped-item-${Date.now()}-${idx + 1}`,
        itemNumber: idx + 1,
        title: cleanTitle,
        description: rewrittenDescription,
        imageUrl: imageMatch.imageUrl,
        imagePrompt: imageMatch.imagePrompt,
        amazonKeyword,
        amazonSearchUrl,
        ctaText,
        estimatedPrice: '$30 - $95',
      };
    });

    // If still empty (e.g. dynamic client-rendered page), provide a cozy template
    if (rewrittenItems.length === 0) {
      const fallbackTitles = [
        'Plush Bouclé Swivel Accent Chair',
        'Warm Amber Arc Floor Lamp',
        'Chunky Knit Chenille Blanket',
        'Natural Handwoven Jute Area Rug',
        'Fluted Ceramic Side Table',
      ];
      fallbackTitles.forEach((ft, i) => {
        const img = matchCozyImage(ft);
        rewrittenItems.push({
          id: `item-${Date.now()}-${i + 1}`,
          itemNumber: i + 1,
          title: ft,
          description: rewriteToCozyTone(ft, ''),
          imageUrl: img.imageUrl,
          imagePrompt: img.imagePrompt,
          amazonKeyword: ft.toLowerCase(),
          amazonSearchUrl: buildAmazonSearchUrl(ft, amazonTag),
          ctaText: `Shop ${ft} on Amazon`,
          estimatedPrice: '$45 - $120',
        });
      });
    }

    const rewrittenTitle = `10 Cozy ${originalTitle.replace(/^(the|top|best|\d+)\s*/i, '')} Ideas You'll Want to Copy Immediately`;
    const metaDescription = `Transform your space with these aesthetic, cozy ${originalTitle.toLowerCase()} ideas. From warm lighting to tactile textiles, here are our favorite budget-friendly Amazon finds.`;

    const rewrittenArticle: Article = {
      id: `scraped-${Date.now()}`,
      slug: rewrittenTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: rewrittenTitle,
      metaDescription,
      category: 'Home Decor',
      tags: ['Cozy Decor', 'Amazon Home', 'Aesthetic Room', 'Home Styling'],
      items: rewrittenItems,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    return NextResponse.json({
      success: true,
      article: rewrittenArticle,
      sourceUrl: url,
      originalTitle,
      itemsCount: rewrittenItems.length,
      message: `Successfully scraped and rewritten "${originalTitle}" into ${rewrittenItems.length} cozy listicle items with Amazon links & images!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
