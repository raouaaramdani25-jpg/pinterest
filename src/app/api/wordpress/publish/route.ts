import { NextResponse } from 'next/server';
import { publishToWordPress } from '@/lib/wordpress';
import { getArticles, saveArticle } from '@/lib/storage';
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
    wpAppPassword: process.env.WP_APP_PASSWORD || 'WfSP R4rl v3Aq DDaD jksn Iy2l',
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { articleId, publishStatus = 'draft', credentials } = body;

    const articles = getArticles();
    const article = articles.find((a) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const saved = getActiveSettings();
    const primaryUsername = credentials?.username || saved.wpUsername || 'admin';
    const appPassword = credentials?.appPassword || saved.wpAppPassword || '';
    const siteUrl = credentials?.siteUrl || saved.wpSiteUrl || 'https://cozyspace.company';

    const creds = {
      siteUrl,
      username: primaryUsername,
      appPassword,
    };

    let result = await publishToWordPress(article, creds, publishStatus);

    // If authentication failed with username 'admin', auto-try the user email
    if (!result.success && result.error && (result.error.includes('401') || result.error.includes('403'))) {
      const emailFallback = 'raouaa.ramdani25@ump.ac.ma';
      if (creds.username !== emailFallback) {
        creds.username = emailFallback;
        result = await publishToWordPress(article, creds, publishStatus);
      }
    }

    if (result.success && result.postId) {
      // Update article record
      article.status = publishStatus === 'publish' ? 'published' : 'draft';
      article.wpPostId = result.postId;
      article.wpPostUrl = result.postUrl;
      article.publishedAt = new Date().toISOString();
      saveArticle(article);

      return NextResponse.json({
        success: true,
        postId: result.postId,
        postUrl: result.postUrl,
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
