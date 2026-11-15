import { NextResponse } from 'next/server';
import { generateReplacementImage, ImageProviderChoice } from '@/lib/image-generator';
import { ArticleItem } from '@/types';

const COMPARISON_PROVIDERS: ImageProviderChoice[] = [
  'google',
  'cloudflare',
  'huggingface',
  'pollinations',
  'recraft',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item: ArticleItem = {
      id: body.id || `comparison-${Date.now()}`,
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

    const requestedProviders = Array.isArray(body.providers)
      ? body.providers.filter((provider: unknown): provider is ImageProviderChoice =>
          typeof provider === 'string' && COMPARISON_PROVIDERS.includes(provider as ImageProviderChoice)
        )
      : COMPARISON_PROVIDERS;

    const results = await Promise.all(requestedProviders.map(async (provider) => {
      try {
        const generated = await generateReplacementImage(
          item,
          item.itemNumber - 1,
          typeof body.customPrompt === 'string' ? body.customPrompt : undefined,
          provider
        );
        return generated
          ? {
              provider,
              success: true,
              imageUrl: generated.url,
              imageAiProvider: generated.provider,
              imageAiModel: generated.model,
            }
          : { provider, success: false, error: 'Provider is not configured.' };
      } catch (error) {
        return {
          provider,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }));

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Image comparison failed.',
    }, { status: 500 });
  }
}
