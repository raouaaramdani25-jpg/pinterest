import { NextResponse } from 'next/server';
import { publishToWordPress } from '@/lib/wordpress';
import { getArticles, saveArticle } from '@/lib/storage';
import { Article } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { articleId, publishStatus = 'draft', credentials } = body;

    const articles = getArticles();
    const article = articles.find((a) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const creds = {
      siteUrl: credentials?.siteUrl || process.env.WP_SITE_URL || 'https://cozyspace.company',
      username: credentials?.username || process.env.WP_USERNAME || 'CozySpaceApp',
      appPassword: credentials?.appPassword || process.env.WP_APP_PASSWORD || '',
    };

    const result = await publishToWordPress(article, creds, publishStatus);

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
