import { NextResponse } from 'next/server';
import { buildAmazonSearchUrl } from '@/lib/amazon';
import { Article, ArticleItem } from '@/types';

export async function POST(req: Request) {
  try {
    const { rawText, sourceUrl, title: customTitle, category: customCat } = await req.json();

    if (!rawText && !sourceUrl) {
      return NextResponse.json({ success: false, error: 'Please provide either raw text or a source URL.' }, { status: 400 });
    }

    let articleTitle = customTitle || 'Cozy Home Inspiration & Decor Ideas';
    let category = customCat || 'Home Decor';
    let items: ArticleItem[] = [];

    // Parse raw text: split by common listicle patterns (numbered lines, headings, double newlines)
    const textContent = (rawText || '').trim();
    const blocks = textContent.split(/\n\s*(?:(?:\d+[\.\)]\s+)|(?:##+\s+))/).filter(Boolean);

    if (blocks.length > 1) {
      // First block might be intro or title if user pasted whole article
      let startIndex = 0;
      if (blocks[0].length < 120 && !blocks[0].includes('\n\n')) {
        articleTitle = blocks[0].replace(/^[#\d\.\s]+/, '').trim();
        startIndex = 1;
      }

      items = blocks.slice(startIndex).map((block: string, idx: number) => {
        const lines = block.trim().split('\n').filter(Boolean);
        const itemTitle = (lines[0] || `Cozy Pick #${idx + 1}`).replace(/^[\d\.\s#]+/, '').trim();
        const itemDesc = lines.slice(1).join(' ').trim() || lines[0] || 'Aesthetic piece to elevate your cozy living space.';
        
        // Extract a clean keyword for Amazon
        const cleanKw = itemTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 40) || 'cozy home decor';

        return {
          id: `item-${Date.now()}-${idx + 1}`,
          itemNumber: idx + 1,
          title: itemTitle,
          description: itemDesc,
          imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
          imagePrompt: `Cozy aesthetic ${cleanKw} in a warm modern living space, natural sunlight`,
          amazonKeyword: cleanKw,
          amazonSearchUrl: buildAmazonSearchUrl(cleanKw),
          ctaText: `Shop ${cleanKw.slice(0, 25)} on Amazon`,
          estimatedPrice: '$25 - $75',
        };
      });
    } else {
      // If single block or short text, split by paragraphs
      const paras = textContent.split(/\n\n+/).filter(Boolean);
      items = paras.map((para: string, idx: number) => {
        const lines = para.split('\n');
        const itemTitle = lines[0].replace(/^[\d\.\s#]+/, '').trim();
        const cleanKw = itemTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 40) || 'cozy decor';

        return {
          id: `item-${Date.now()}-${idx + 1}`,
          itemNumber: idx + 1,
          title: itemTitle,
          description: lines.slice(1).join(' ') || lines[0],
          imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
          imagePrompt: `Aesthetic cozy home detail, ${cleanKw}`,
          amazonKeyword: cleanKw,
          amazonSearchUrl: buildAmazonSearchUrl(cleanKw),
          ctaText: `View on Amazon`,
          estimatedPrice: '$30',
        };
      });
    }

    // Fallback if no items detected
    if (items.length === 0) {
      items = [
        {
          id: `item-${Date.now()}-1`,
          itemNumber: 1,
          title: customTitle || 'Cozy Decor Essential',
          description: textContent.slice(0, 300) || 'Add this warm aesthetic piece to your cozy collection.',
          imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
          imagePrompt: 'Cozy aesthetic living room',
          amazonKeyword: 'cozy home decor',
          amazonSearchUrl: buildAmazonSearchUrl('cozy home decor'),
          ctaText: 'Shop on Amazon',
        },
      ];
    }

    return NextResponse.json({
      success: true,
      article: {
        title: articleTitle,
        category,
        items,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
