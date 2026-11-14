import { NextResponse } from 'next/server';
import { getArticles, saveArticle } from '@/lib/storage';
import { Article } from '@/types';

export async function GET() {
  try {
    const articles = getArticles();
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

    saveArticle(body);
    return NextResponse.json({ success: true, article: body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
