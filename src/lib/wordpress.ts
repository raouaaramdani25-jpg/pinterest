import { Article } from '@/types';
import { FTC_DISCLOSURE_HTML } from './amazon';

// Allow connecting to WordPress sites even with custom, self-signed, or Let's Encrypt chain issues
if (typeof process !== 'undefined') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export interface WpCredentials {
  siteUrl: string;
  username: string;
  appPassword: string;
}

export function getBasicAuthHeader(username: string, appPassword: string): string {
  // Strip any extra spaces if user pasted password with spaces
  const cleanPass = appPassword.replace(/\s+/g, '');
  const encoded = Buffer.from(`${username.trim()}:${cleanPass}`).toString('base64');
  return `Basic ${encoded}`;
}

export function formatArticleForWordPress(article: Article): string {
  let content = '';

  // 1. Mandatory Amazon Associate FTC Disclosure at the very top
  content += `${FTC_DISCLOSURE_HTML}\n\n`;

  // 2. Engaging Intro Paragraph
  content += `<p style="font-size:1.15rem;line-height:1.8;color:#2f1f1a;margin-bottom:32px;">${article.metaDescription}</p>\n\n`;

  // 3. Listicle Items with styled images and CTA buttons
  article.items.forEach((item, index) => {
    const itemNumber = item.itemNumber || index + 1;
    const affiliateUrl = item.directAmazonUrl || item.amazonSearchUrl;
    const ctaText = item.ctaText || `Check Price on Amazon: ${item.amazonKeyword}`;

    content += `<!-- wp:heading {"level":2} -->\n`;
    content += `<h2 style="color:#553c30;margin-top:38px;margin-bottom:14px;font-size:1.5rem;font-weight:700;">${itemNumber}. ${item.title}</h2>\n`;
    content += `<!-- /wp:heading -->\n\n`;

    // Image block if available
    if (item.imageUrl) {
      content += `<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->\n`;
      content += `<figure class="wp-block-image size-large" style="margin:20px 0;">\n`;
      content += `  <img src="${item.imageUrl}" alt="${item.title.replace(/"/g, '&quot;')}" style="border-radius:10px;width:100%;max-width:820px;height:auto;box-shadow:0 6px 18px rgba(0,0,0,0.06);display:block;" />\n`;
      content += `</figure>\n`;
      content += `<!-- /wp:image -->\n\n`;
    }

    // Item description
    content += `<!-- wp:paragraph -->\n`;
    content += `<p style="line-height:1.85;color:#443329;font-size:1.05rem;margin-bottom:18px;">${item.description}</p>\n`;
    content += `<!-- /wp:paragraph -->\n\n`;

    // High-converting styled Amazon Affiliate Button
    content += `<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->\n`;
    content += `<div class="wp-block-buttons" style="margin:20px 0 35px 0;">\n`;
    content += `  <div class="wp-block-button">\n`;
    content += `    <a class="wp-block-button__link wp-element-button" href="${affiliateUrl}" target="_blank" rel="nofollow sponsored noopener" style="background:#FF9900;background:linear-gradient(135deg, #FF9900 0%, #e68a00 100%);color:#111;padding:12px 24px;border-radius:30px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(255,153,0,0.3);font-size:0.95rem;">\n`;
    content += `      🛒 ${ctaText}\n`;
    content += `    </a>\n`;
    content += `  </div>\n`;
    content += `</div>\n`;
    content += `<!-- /wp:buttons -->\n\n`;

    content += `<hr style="border:0;border-top:1px dashed #d7c1a8;margin:35px 0;" />\n\n`;
  });

  // 4. Outro / Call to Action to Pin on Pinterest
  content += `<!-- wp:heading {"level":3} -->\n`;
  content += `<h3 style="color:#553c30;margin-top:28px;">Love These Cozy Ideas? Save This Pin!</h3>\n`;
  content += `<!-- /wp:heading -->\n\n`;
  content += `<p style="line-height:1.75;color:#443329;">Be sure to save this post to your favorite <strong>Home Decor & Cozy Living</strong> boards on Pinterest so you can always come back when you're ready to refresh your space!</p>\n`;

  return content;
}

