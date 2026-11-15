import { NextResponse } from 'next/server';
import { publishToWordPress } from '@/lib/wordpress-server';
import { getArticleById, saveArticle } from '@/lib/storage';
import { Article } from '@/types';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function getActiveSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch {}
  }
  return {
    wpSiteUrl: process.env.WP_SITE_URL || 'https://cozyspace.company',
    wpUsername: process.env.WP_USERNAME || 'admin',
    wpAppPassword: process.env.WP_APP_PASSWORD || '',
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { articleId, publishStatus = 'draft', credentials, article: providedArticle } = body;

    const isValidProvided =
      providedArticle &&
      typeof providedArticle.title === 'string' &&
      Array.isArray(providedArticle.items) &&
      providedArticle.items.length > 0;
    const article: Article | null =
      (isValidProvided ? (providedArticle as Article) : null) ||
      (typeof articleId === 'string' ? await getArticleById(articleId) : null);

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const saved = getActiveSettings();
    const primaryUsername = credentials?.username || saved.wpUsername || '';
    const appPassword = credentials?.appPassword || saved.wpAppPassword || '';
    const siteUrl = credentials?.siteUrl || saved.wpSiteUrl || 'https://cozyspace.company';

    if (!primaryUsername || !appPassword) {
      return NextResponse.json({
        success: false,
        error: 'WordPress credentials are not configured. Add them in Settings.',
      }, { status: 400 });
    }

    const creds = {
      siteUrl,
      username: primaryUsername,
      appPassword,
    };

    let result = await publishToWordPress(article, creds, publishStatus);

    if (result.success && result.postId) {
      // Update article record
      article.status = publishStatus === 'publish' ? 'published' : 'draft';
      article.wpPostId = result.postId;
      article.wpPostUrl = result.postUrl;
      article.publishedAt = new Date().toISOString();
      await saveArticle(article);

      return NextResponse.json({
        success: true,
        postId: result.postId,
        postUrl: result.postUrl,
        article,
        message: `Successfully uploaded "${article.title}" to WordPress as ${publishStatus.toUpperCase()}!`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to publish to WordPress',
      }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
