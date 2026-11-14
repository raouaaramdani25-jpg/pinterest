import fs from 'fs/promises';
import path from 'path';
import { ArticleItem } from '@/types';

type GeneratedImage = {
  data: Buffer;
  mimeType: string;
};

const GOOGLE_IMAGE_MODEL = process.env.GOOGLE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const CLOUDFLARE_IMAGE_MODEL =
  process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/runwayml/stable-diffusion-v1-5-img2img';
const RECRAFT_IMAGE_MODEL = 'recraft/recraft-v4.1-flash-v2:free';

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
  };
}

async function generateWithCloudflare(
  prompt: string,
  sourceImage: GeneratedImage
): Promise<GeneratedImage | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) return null;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${prompt} Create a new original image inspired by the reference image.`,
        image: sourceImage.data.toString('base64'),
      }),
    }
  );

  if (!response.ok) throw new Error(`Cloudflare image API returned HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('image/')) {
    return { data: Buffer.from(await response.arrayBuffer()), mimeType: contentType.split(';')[0] };
  }

  const data = await response.json();
  const image = data.result?.image || data.result?.images?.[0] || data.image;
  if (typeof image !== 'string') throw new Error('Cloudflare returned no generated image.');

  return { data: decodeBase64(image), mimeType: 'image/png' };
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
    return { data: decodeBase64(image.b64_json), mimeType: 'image/png' };
  }

  if (image.url) {
    const imageResponse = await fetch(image.url);
    if (!imageResponse.ok) throw new Error('Could not download the Recraft image.');
    return {
      data: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: imageResponse.headers.get('content-type')?.split(';')[0] || 'image/png',
    };
  }

  throw new Error('Recraft returned an unsupported image format.');
}

async function saveGeneratedImage(image: GeneratedImage, item: ArticleItem, index: number): Promise<string> {
  const extension = image.mimeType.includes('jpeg') ? 'jpg' : 'png';
  const filename = `rewrite-${Date.now()}-${index + 1}-${item.id}.${extension}`;
  const outputDir = path.join(process.cwd(), 'public', 'generated');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, filename), image.data);
  return `/generated/${filename}`;
}

export async function generateReplacementImage(
  item: ArticleItem,
  index: number,
  customPrompt?: string
): Promise<string | null> {
  const sourceImage = item.imageUrl ? await fetchSourceImage(item.imageUrl) : null;
  const prompt = `${customPrompt?.trim() || `${item.title}. ${item.imagePrompt || item.description}`}. Warm, premium, realistic home decor photography.`;
  let generatedImage: GeneratedImage | null = null;

  for (const provider of [
    () => sourceImage ? generateWithGoogle(prompt, sourceImage) : null,
    () => sourceImage ? generateWithCloudflare(prompt, sourceImage) : null,
    () => generateWithRecraft(prompt),
  ]) {
    try {
      generatedImage = await provider();
      if (generatedImage) break;
    } catch (error) {
      console.warn('Image provider failed; trying the next provider:', error);
    }
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
      item.imageUrl = generatedUrl;
      generatedCount += 1;
    }
  }

  return generatedCount;
}
