import { NextResponse } from 'next/server';
import { buildAmazonSearchUrl, DEFAULT_AMAZON_TAG } from '@/lib/amazon';
import { matchCozyImage } from '@/lib/image-matcher';
import { Article, ArticleItem } from '@/types';

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

interface AiRewriteResult {
  title?: string;
  metaDescription?: string;
  items?: Array<{
    title?: string;
    description?: string;
  }>;
}

type TextRewriteProvider = 'auto' | 'gemini' | 'groq' | 'cerebras' | 'cloudflare' | 'openrouter';

type TextRewriteResponse = {
  result: AiRewriteResult;
  provider: string;
  model: string;
};

const REWRITE_SYSTEM_PROMPT = [
  'You rewrite home decor content into original, natural English for a cozy lifestyle blog.',
  'Do not copy the source wording. Keep factual meaning, avoid inventing product specifications, and use an inviting but useful tone.',
  'Return JSON only, with this exact shape: {"title":"string","metaDescription":"string","items":[{"title":"string","description":"string"}]}.',
  'Return exactly one item for every input item, in the same order.',
].join(' ');

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  label: string
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseRewriteContent(content: unknown, provider: string): AiRewriteResult {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(`${provider} returned an empty rewrite response.`);
  }
  const jsonContent = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const result = JSON.parse(jsonContent) as AiRewriteResult;
  if (!Array.isArray(result.items)) {
    throw new Error(`${provider} returned an incomplete rewrite response.`);
  }
  return result;
}

function rewritePayload(originalTitle: string, originalDesc: string, items: { title: string; desc: string }[]) {
  return JSON.stringify({
    sourceTitle: originalTitle,
    sourceDescription: originalDesc,
    items,
  });
}

async function rewriteWithOpenRouter(
  originalTitle: string,
  originalDesc: string,
  items: { title: string; desc: string }[]
): Promise<TextRewriteResponse | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || items.length === 0) {
    return null;
  }

  const model = process.env.OPENROUTER_TEXT_MODEL || 'nvidia/nemotron-3.5-super-vl:free';
  const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': 'CozySpace Automation',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: REWRITE_SYSTEM_PROMPT },
        { role: 'user', content: rewritePayload(originalTitle, originalDesc, items) },
      ],
    }),
  }, 45_000, 'OpenRouter rewrite');

  if (!response.ok) {
    throw new Error(`OpenRouter API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  return {
    result: parseRewriteContent(data.choices?.[0]?.message?.content, 'OpenRouter'),
    provider: 'OpenRouter',
    model,
  };
}

async function rewriteWithGemini(
  originalTitle: string,
  originalDesc: string,
  items: { title: string; desc: string }[]
): Promise<TextRewriteResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || items.length === 0) return null;

  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: REWRITE_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: rewritePayload(originalTitle, originalDesc, items) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      }),
    },
    45_000,
    'Gemini rewrite'
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: HTTP ${response.status}: ${errorBody.slice(0, 300)}`);
  }
  const data = await response.json();
  return {
    result: parseRewriteContent(
      data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => part.text)?.text,
      'Gemini'
    ),
    provider: 'Google Gemini',
    model,
  };
}

async function rewriteWithOpenAICompatible(
  provider: 'Groq' | 'Cerebras',
  endpoint: string,
  apiKey: string | undefined,
  model: string,
  originalTitle: string,
  originalDesc: string,
  items: { title: string; desc: string }[]
): Promise<TextRewriteResponse | null> {
  if (!apiKey || items.length === 0) return null;

  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: REWRITE_SYSTEM_PROMPT },
        { role: 'user', content: rewritePayload(originalTitle, originalDesc, items) },
      ],
    }),
  }, 45_000, `${provider} rewrite`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`${provider} API error: HTTP ${response.status}: ${errorBody.slice(0, 300)}`);
  }
  const data = await response.json();
  return {
    result: parseRewriteContent(data.choices?.[0]?.message?.content, provider),
    provider,
    model,
  };
}

async function rewriteWithCloudflare(
  originalTitle: string,
  originalDesc: string,
  items: { title: string; desc: string }[]
): Promise<TextRewriteResponse | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken || items.length === 0) return null;

  const model = process.env.CLOUDFLARE_TEXT_REWRITE_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  const response = await fetchWithTimeout(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: REWRITE_SYSTEM_PROMPT },
          { role: 'user', content: rewritePayload(originalTitle, originalDesc, items) },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    },
    45_000,
    'Cloudflare rewrite'
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudflare text API error: HTTP ${response.status}: ${errorBody.slice(0, 300)}`);
  }
  const data = await response.json();
  return {
    result: parseRewriteContent(data.result?.response, 'Cloudflare'),
    provider: 'Cloudflare Workers AI',
    model,
  };
}

async function rewriteWithProvider(
  provider: TextRewriteProvider,
  originalTitle: string,
  originalDesc: string,
  items: { title: string; desc: string }[]
): Promise<TextRewriteResponse | null> {
  const providers: Record<Exclude<TextRewriteProvider, 'auto'>, () => Promise<TextRewriteResponse | null>> = {
    gemini: () => rewriteWithGemini(originalTitle, originalDesc, items),
    groq: () => rewriteWithOpenAICompatible(
      'Groq',
      'https://api.groq.com/openai/v1/chat/completions',
      process.env.GROQ_API_KEY,
      process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile',
      originalTitle,
      originalDesc,
      items
    ),
    cerebras: () => rewriteWithOpenAICompatible(
      'Cerebras',
      'https://api.cerebras.ai/v1/chat/completions',
      process.env.CEREBRAS_API_KEY,
      process.env.CEREBRAS_TEXT_MODEL || 'llama-3.3-70b',
      originalTitle,
      originalDesc,
      items
    ),
    cloudflare: () => rewriteWithCloudflare(originalTitle, originalDesc, items),
    openrouter: () => rewriteWithOpenRouter(originalTitle, originalDesc, items),
  };

  const order: Exclude<TextRewriteProvider, 'auto'>[] = provider === 'auto'
    ? ['gemini', 'groq', 'cerebras', 'cloudflare', 'openrouter']
    : [provider];
  const errors: string[] = [];

  for (const candidate of order) {
    try {
      const result = await providers[candidate]();
      if (result) return result;
      errors.push(`${candidate}: provider is not configured or returned no result`);
    } catch (error) {
      errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
      console.warn('Text rewrite provider failed:', error);
      if (provider !== 'auto') break;
    }
  }

  if (errors.length > 0) throw new Error(errors.join(' | '));
  return null;
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
    const {
      url,
      amazonTag = DEFAULT_AMAZON_TAG,
      rewriteProvider = 'gemini',
    } = await req.json() as { url?: string; amazonTag?: string; rewriteProvider?: TextRewriteProvider };
    const selectedRewriteProvider: TextRewriteProvider = [
      'gemini',
      'groq',
      'cerebras',
      'cloudflare',
      'openrouter',
    ].includes(rewriteProvider) ? rewriteProvider : 'gemini';

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid website URL.' }, { status: 400 });
    }

    // 1. Fetch competitor webpage
    let html = '';
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        next: { revalidate: 0 },
      }, 30_000, 'Competitor website');

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

    let aiRewrite: AiRewriteResult | null = null;
    let aiProvider = '';
    let aiModel = '';
    let usedAiRewrite = false;
    if (itemsToProcess.length > 0) {
      try {
        if (selectedRewriteProvider === 'auto') {
          throw new Error('Choose a specific text rewrite provider instead of Auto fallback.');
        }
        const rewriteResponse = await rewriteWithProvider(
          selectedRewriteProvider,
          originalTitle,
          originalDesc,
          itemsToProcess
        );
        aiRewrite = rewriteResponse?.result || null;
        aiProvider = rewriteResponse?.provider || '';
        aiModel = rewriteResponse?.model || '';
        usedAiRewrite = Boolean(aiRewrite);
      } catch (aiError) {
        const message = aiError instanceof Error ? aiError.message : String(aiError);
        return NextResponse.json({
          success: false,
          error: `Text rewriting failed with ${selectedRewriteProvider}: ${message}`,
        }, { status: 502 });
      }
    }

    // 4. Construct Rewritten Listicle Items with Amazon Links & Aesthetic Images
    const rewrittenItems: ArticleItem[] = itemsToProcess.map((item, idx) => {
      const sourceTitle = item.title.replace(/^[\d\.\s#\-]+/, '').trim();
      const cleanTitle = aiRewrite?.items?.[idx]?.title?.trim() || sourceTitle;
      const rewrittenDescription =
        aiRewrite?.items?.[idx]?.description?.trim() || rewriteToCozyTone(cleanTitle, item.desc);
      
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
        textAiProvider: usedAiRewrite ? aiProvider : 'Local fallback',
        textAiModel: usedAiRewrite ? aiModel : 'Local cozy-tone rewriter',
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
          textAiProvider: usedAiRewrite ? aiProvider : 'Local fallback',
          textAiModel: usedAiRewrite ? aiModel : 'Local cozy-tone rewriter',
          amazonKeyword: ft.toLowerCase(),
          amazonSearchUrl: buildAmazonSearchUrl(ft, amazonTag),
          ctaText: `Shop ${ft} on Amazon`,
          estimatedPrice: '$45 - $120',
        });
      });
    }

    const rewrittenTitle =
      aiRewrite?.title?.trim() ||
      `10 Cozy ${originalTitle.replace(/^(the|top|best|\d+)\s*/i, '')} Ideas You'll Want to Copy Immediately`;
    const metaDescription =
      aiRewrite?.metaDescription?.trim() ||
      `Transform your space with these aesthetic, cozy ${originalTitle.toLowerCase()} ideas. From warm lighting to tactile textiles, here are our favorite budget-friendly Amazon finds.`;

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
      textAiProvider: usedAiRewrite ? aiProvider : 'Local fallback',
      textAiModel: usedAiRewrite ? aiModel : 'Local cozy-tone rewriter',
    };

    return NextResponse.json({
      success: true,
      article: rewrittenArticle,
      sourceUrl: url,
      originalTitle,
      itemsCount: rewrittenItems.length,
      message: `Successfully scraped and ${usedAiRewrite ? `AI-rewritten with ${aiProvider} (${aiModel})` : 'rewritten locally'} "${originalTitle}" into ${rewrittenItems.length} cozy listicle items. Image generation will continue in the Article Generator.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
