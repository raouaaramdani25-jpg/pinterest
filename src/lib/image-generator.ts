import fs from 'fs/promises';
import path from 'path';
import { ArticleItem } from '@/types';

type GeneratedImage = {
  data: Buffer;
  mimeType: string;
  provider?: string;
  model?: string;
};

export type ImageGenerationResult = {
  url: string;
  provider: string;
  model: string;
};
export type ImageProviderChoice = 'auto' | 'google' | 'cloudflare' | 'recraft';

const GOOGLE_IMAGE_MODEL = process.env.GOOGLE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const CLOUDFLARE_IMAGE_MODEL =
  process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/stabilityai/stable-diffusion-xl-base-1.0';
const CLOUDFLARE_TEXT_MODEL =
  process.env.CLOUDFLARE_TEXT_MODEL || '@cf/black-forest-labs/flux-1-schnell';
const CLOUDFLARE_IMAGE_STRENGTH = 0.65;
const CLOUDFLARE_IMAGE_STEPS = 20;
const RECRAFT_IMAGE_MODEL = 'recraft/recraft-v4.1-flash-v2:free';
const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

function decodeBase64(value: string): Buffer {
  const cleanValue = value.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(cleanValue, 'base64');
}

async function fetchSourceImage(imageUrl: string): Promise<GeneratedImage | null> {
  try {
    let data: Buffer;
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('/')) {
      data = await fs.readFile(path.join(process.cwd(), 'public', imageUrl.replace(/^\//, '')));
    } else {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      mimeType = response.headers.get('content-type')?.split(';')[0] || mimeType;
      data = Buffer.from(await response.arrayBuffer());
    }

    return { data, mimeType };
  } catch {
    return null;
  }
}

async function generateWithGoogle(
  prompt: string,
  sourceImage: GeneratedImage
): Promise<GeneratedImage | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_IMAGE_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `${prompt} Create a new original image inspired by the reference image, not a copy.` },
            {
              inline_data: {
                mime_type: sourceImage.mimeType,
                data: sourceImage.data.toString('base64'),
              },
            },
          ],
        }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    }
  );

  if (!response.ok) throw new Error(`Google image API returned HTTP ${response.status}`);
  const data = await response.json();
  const part = data.candidates?.[0]?.content?.parts?.find(
    (candidatePart: { inlineData?: { data?: string; mimeType?: string }; inline_data?: { data?: string; mime_type?: string } }) =>
      candidatePart.inlineData?.data || candidatePart.inline_data?.data
  );
  const image = part?.inlineData || part?.inline_data;
  if (!image?.data) throw new Error('Google returned no generated image.');

  return {
    data: decodeBase64(image.data),
    mimeType: image.mimeType || image.mime_type || 'image/png',
    provider: 'Google Gemini',
    model: GOOGLE_IMAGE_MODEL,
  };
}

async function callCloudflareImageModel(
  model: string,
  payload: Record<string, unknown>,
  accountId: string,
  apiToken: string
): Promise<GeneratedImage> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Accept: 'image/png',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudflare image API returned HTTP ${response.status}: ${errorBody.slice(0, 500)}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('image/')) {
    return {
      data: Buffer.from(await response.arrayBuffer()),
      mimeType: contentType.split(';')[0],
      provider: 'Cloudflare Workers AI',
      model,
    };
  }

  const data = await response.json();
  const image = data.result?.image || data.result?.images?.[0] || data.image;
  if (typeof image !== 'string') throw new Error('Cloudflare returned no generated image.');

  return {
    data: decodeBase64(image),
    mimeType: 'image/png',
    provider: 'Cloudflare Workers AI',
    model,
  };
}

async function generateWithCloudflare(
  prompt: string,
  sourceImage: GeneratedImage
): Promise<GeneratedImage | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) return null;
  let img2imgError: unknown;

  if (sourceImage.mimeType.startsWith('image/') && sourceImage.data.length <= MAX_SOURCE_IMAGE_BYTES) {
    try {
      return await callCloudflareImageModel(
        CLOUDFLARE_IMAGE_MODEL,
        {
          // Lower strength keeps more of the original composition; increase it for a bigger redesign.
          prompt: `${prompt} Create a new original image inspired by the reference image.`,
          image: Array.from(sourceImage.data),
          strength: CLOUDFLARE_IMAGE_STRENGTH,
          num_steps: CLOUDFLARE_IMAGE_STEPS,
        },
        accountId,
        apiToken
      );
    } catch (error) {
      img2imgError = error;
      console.warn('Cloudflare img2img failed; trying fallback generation:', error);
    }
  } else {
    img2imgError = new Error('Cloudflare requires a valid image input up to 10MB.');
  }

  try {
    const openRouterFallback = await generateWithRecraft(prompt);
    if (openRouterFallback) return openRouterFallback;
  } catch (error) {
    console.warn('OpenRouter fallback failed after Cloudflare img2img:', error);
  }

  try {
    return await callCloudflareImageModel(
      CLOUDFLARE_TEXT_MODEL,
      {
        prompt: `${prompt} Create a new original image with a similar subject and mood.`,
        num_steps: 4,
      },
      accountId,
      apiToken
    );
  } catch (textToImageError) {
    throw new Error(
      `Cloudflare img2img failed: ${img2imgError instanceof Error ? img2imgError.message : String(img2imgError)}. ` +
      `Cloudflare text-to-image fallback failed: ${textToImageError instanceof Error ? textToImageError.message : String(textToImageError)}`
    );
  }
}

async function generateWithRecraft(prompt: string): Promise<GeneratedImage | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': 'CozySpace Automation',
    },
    body: JSON.stringify({
      model: RECRAFT_IMAGE_MODEL,
      prompt: `Original cozy home decor editorial photograph, ${prompt}. No logos, no watermark, no copied composition.`,
      size: '1024x1024',
    }),
  });

  if (!response.ok) throw new Error(`Recraft image API returned HTTP ${response.status}`);
  const data = await response.json();
  const image = data.data?.[0];
  if (!image) throw new Error('Recraft returned no generated image.');

  if (image.b64_json) {
    return {
      data: decodeBase64(image.b64_json),
      mimeType: 'image/png',
      provider: 'OpenRouter',
      model: RECRAFT_IMAGE_MODEL,
    };
  }

  if (image.url) {
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) throw new Error('Could not download the Recraft image.');
    return {
      data: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: imageResponse.headers.get('content-type')?.split(';')[0] || 'image/png',
      provider: 'OpenRouter',
      model: RECRAFT_IMAGE_MODEL,
    };
  }

  throw new Error('Recraft returned an unsupported image format.');
}

async function saveGeneratedImage(image: GeneratedImage, item: ArticleItem, index: number): Promise<ImageGenerationResult> {
  return {
    url: `data:${image.mimeType};base64,${image.data.toString('base64')}`,
    provider: image.provider || 'Unknown',
    model: image.model || 'Unknown',
  };
}

export async function generateReplacementImage(
  item: ArticleItem,
  index: number,
  customPrompt?: string,
  preferredProvider: ImageProviderChoice = 'auto'
): Promise<ImageGenerationResult | null> {
  const sourceImage = item.imageUrl ? await fetchSourceImage(item.imageUrl) : null;
  const prompt = `${customPrompt?.trim() || `${item.title}. ${item.imagePrompt || item.description}`}. Warm, premium, realistic home decor photography.`;
  let generatedImage: GeneratedImage | null = null;

  const providers = {
    google: () => sourceImage ? generateWithGoogle(prompt, sourceImage) : null,
    cloudflare: () => sourceImage ? generateWithCloudflare(prompt, sourceImage) : null,
    recraft: () => generateWithRecraft(prompt),
  };
  const providerOrder = preferredProvider === 'auto'
    ? [
        ['Google Gemini', providers.google],
        ['Cloudflare Workers AI', providers.cloudflare],
        ['OpenRouter Recraft', providers.recraft],
      ] as const
    : [[preferredProvider, providers[preferredProvider]]] as const;
  const providerErrors: string[] = [];

  for (const [providerName, provider] of providerOrder) {
    try {
      generatedImage = await provider();
      if (generatedImage) break;
    } catch (error) {
      providerErrors.push(`${providerName}: ${error instanceof Error ? error.message : String(error)}`);
      console.warn('Image provider failed; trying the next provider:', error);
    }
  }

  if (!generatedImage && providerErrors.length > 0) {
    throw new Error(providerErrors.join(' | '));
  }

  return generatedImage ? saveGeneratedImage(generatedImage, item, index) : null;
}

export async function generateReplacementImages(items: ArticleItem[]): Promise<number> {
  let generatedCount = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item.imageUrl) continue;

    const generatedUrl = await generateReplacementImage(item, index);
    if (generatedUrl) {
      item.imageUrl = generatedUrl.url;
      item.imageAiProvider = generatedUrl.provider;
      item.imageAiModel = generatedUrl.model;
      generatedCount += 1;
    }
  }

  return generatedCount;
}
