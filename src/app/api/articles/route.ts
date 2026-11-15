import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { deleteArticle, getArticleById, getArticles, saveArticle } from '@/lib/storage';
import { Article } from '@/types';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json({ success: true, articles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Article = await req.json();
    if (!body.title || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid article data' }, { status: 400 });
    }

    if (!body.id) {
      body.id = 'article-' + Date.now();
    }
    if (!body.createdAt) {
      body.createdAt = new Date().toISOString();
    }
    if (!body.status) {
      body.status = 'draft';
    }

    await saveArticle(body);
    return NextResponse.json({ success: true, article: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Article id is required' }, { status: 400 });
    }

    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ success: true, deletedImages: 0 });
    }

    const generatedDir = path.resolve(process.cwd(), 'public', 'generated');
    let deletedImages = 0;
    const blobUrls: string[] = [];
    for (const item of article.items || []) {
      if (!item.imageUrl) continue;

      try {
        const imageUrl = new URL(item.imageUrl);
        if (imageUrl.hostname.endsWith('.public.blob.vercel-storage.com')) {
          blobUrls.push(imageUrl.toString());
          continue;
        }
      } catch {}

      if (!item.imageUrl.startsWith('/generated/')) continue;
      const imagePath = path.resolve(process.cwd(), 'public', item.imageUrl.slice(1));
      if (imagePath.startsWith(`${generatedDir}${path.sep}`) && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        deletedImages += 1;
      }
    }

    if (blobUrls.length > 0) {
      const uniqueBlobUrls = Array.from(new Set(blobUrls));
      await del(uniqueBlobUrls);
      deletedImages += uniqueBlobUrls.length;
    }

    await deleteArticle(id);

    return NextResponse.json({ success: true, deletedImages });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
