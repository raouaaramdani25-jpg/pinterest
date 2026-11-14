import fs from 'fs';
import path from 'path';
import { Article } from '@/types';
import { formatArticleForWordPress, getBasicAuthHeader, WpCredentials } from './wordpress';

async function uploadFeaturedMedia(
  imageUrl: string,
  credentials: WpCredentials,
  title: string
): Promise<number | null> {
  if (!imageUrl) return null;

  try {
    const cleanSiteUrl = credentials.siteUrl.replace(/\/+$/, '');
    const mediaEndpoint = `${cleanSiteUrl}/wp-json/wp/v2/media`;
    const authHeader = getBasicAuthHeader(credentials.username, credentials.appPassword);
    let buffer: Buffer | null = null;

    if (imageUrl.startsWith('/') || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      const localPath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
      }
    }

    if (!buffer) {
      const imgRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (!imgRes.ok) return null;
      buffer = Buffer.from(await imgRes.arrayBuffer());
    }

    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `cozyspace-${safeTitle}-${Date.now()}.jpg`;
    const uploadRes = await fetch(mediaEndpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'image/jpeg',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Origin: cleanSiteUrl,
        Referer: `${cleanSiteUrl}/wp-admin/`,
      },
      body: new Uint8Array(buffer),
    });

    if (uploadRes.ok) {
      const mediaData = await uploadRes.json();
      return mediaData.id;
    }
  } catch (err) {
    console.warn('Featured media auto-upload skipped:', err);
  }

  return null;
}

export async function publishToWordPress(
  article: Article,
  credentials: WpCredentials,
  publishStatus: 'draft' | 'publish' = 'draft'
): Promise<{ success: boolean; postId?: number; postUrl?: string; error?: string }> {
  const cleanSiteUrl = credentials.siteUrl.replace(/\/+$/, '');
  const endpoint = `${cleanSiteUrl}/wp-json/wp/v2/posts`;
  const authHeader = getBasicAuthHeader(credentials.username, credentials.appPassword);
  const formattedContent = formatArticleForWordPress(article);

  let featuredMediaId: number | null = null;
  const heroImage = article.items?.[0]?.imageUrl;
  if (heroImage) {
    featuredMediaId = await uploadFeaturedMedia(heroImage, credentials, article.title);
  }

  const payload: Record<string, unknown> = {
    title: article.title,
    content: formattedContent,
    status: publishStatus,
    excerpt: article.metaDescription,
  };

  if (featuredMediaId) {
    payload.featured_media = featuredMediaId;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        Origin: cleanSiteUrl,
        Referer: `${cleanSiteUrl}/wp-admin/`,
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      let friendlyError = `WordPress API status ${response.status}`;
      if (errText.includes('openresty') || errText.includes('403 Forbidden')) {
        friendlyError = `Hosting Firewall / WAF blocked the REST API call (403 Forbidden). You can use the "Copy Gutenberg Blocks" button to paste with 1-click in WP Admin, or disable REST API restriction in your host panel (Hostinger/Cloudflare).`;
      } else {
        friendlyError = `${friendlyError}: ${errText.slice(0, 300)}`;
      }
      return { success: false, error: friendlyError };
    }

    const data = await response.json();
    return { success: true, postId: data.id, postUrl: data.link };
  } catch (err: any) {
    const detailedCause = err.cause ? ` (${err.cause.code || err.cause.message || err.cause})` : '';
    return {
      success: false,
      error: `Network error connecting to WordPress: ${err.message}${detailedCause}. Check site SSL or firewall.`,
    };
  }
}
