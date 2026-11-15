import { NextResponse } from 'next/server';
import { generateReplacementImage, ImageProviderChoice } from '@/lib/image-generator';
import { ArticleItem } from '@/types';

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
