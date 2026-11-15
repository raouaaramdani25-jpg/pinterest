import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateReplacementImage, ImageProviderChoice } from '@/lib/image-generator';
import { ArticleItem } from '@/types';

function removeGeneratedFile(imageUrl: string) {
  if (!imageUrl.startsWith('/generated/')) return;

  const generatedDir = path.resolve(process.cwd(), 'public', 'generated');
  const imagePath = path.resolve(process.cwd(), 'public', imageUrl.slice(1));
  if (imagePath.startsWith(`${generatedDir}${path.sep}`) && fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item: ArticleItem = {
      id: body.id || `regenerated-${Date.now()}`,
      itemNumber: Number(body.itemNumber) || 1,
      title: String(body.title || 'Cozy home decor'),
      description: String(body.description || ''),
      imageUrl: String(body.imageUrl || ''),
      imagePrompt: String(body.imagePrompt || ''),
      amazonKeyword: '',
      amazonSearchUrl: '',
      ctaText: '',
    };

    if (!item.imageUrl) {
      return NextResponse.json({ success: false, error: 'An existing image is required.' }, { status: 400 });
    }

    const generatedImage = await generateReplacementImage(
      item,
      item.itemNumber - 1,
      typeof body.customPrompt === 'string' ? body.customPrompt : undefined,
      ['auto', 'google', 'cloudflare', 'recraft'].includes(body.provider) ? body.provider as ImageProviderChoice : 'auto'
    );

    if (!generatedImage) {
      return NextResponse.json({
        success: false,
        error: 'All configured image providers failed to generate a replacement.',
      }, { status: 502 });
    }

    removeGeneratedFile(item.imageUrl);
    return NextResponse.json({
      success: true,
      imageUrl: generatedImage.url,
      imageAiProvider: generatedImage.provider,
      imageAiModel: generatedImage.model,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Image regeneration failed.' }, { status: 500 });
  }
}
