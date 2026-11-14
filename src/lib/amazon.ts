/**
 * Amazon Associates Compliance Helpers
 * Ensures 100% adherence to Amazon Operating Agreement & FTC Guidelines:
 * - Proper rel="nofollow sponsored noopener"
 * - Prominent affiliate disclosure
 * - Clean, non-cloaked links with tracking tag
 */

export const DEFAULT_AMAZON_TAG = 'cozyplace04-20';

export function buildAmazonSearchUrl(keyword: string, tag: string = DEFAULT_AMAZON_TAG): string {
  const cleanKeyword = keyword.trim().replace(/\s+/g, '+');
  const cleanTag = tag.trim() || DEFAULT_AMAZON_TAG;
  return `https://www.amazon.com/s?k=${cleanKeyword}&tag=${cleanTag}`;
}

export function buildAmazonDirectUrl(asinOrUrl: string, tag: string = DEFAULT_AMAZON_TAG): string {
  const cleanTag = tag.trim() || DEFAULT_AMAZON_TAG;
  if (!asinOrUrl) return '';
  
  // If it's already an amazon URL, append/replace the tag
  if (asinOrUrl.includes('amazon.com')) {
    try {
      const url = new URL(asinOrUrl);
      url.searchParams.set('tag', cleanTag);
      return url.toString();
    } catch {
      return `${asinOrUrl}?tag=${cleanTag}`;
    }
  }
  
  // If it's just an ASIN code (e.g. B08N5WRWNW)
  const asinMatch = asinOrUrl.match(/^[A-Z0-9]{10}$/i);
  if (asinMatch) {
    return `https://www.amazon.com/dp/${asinOrUrl}?tag=${cleanTag}`;
  }

  return asinOrUrl;
}

export const FTC_DISCLOSURE_TEXT = 
  "As an Amazon Associate, I earn from qualifying purchases at no additional cost to you.";

export const FTC_DISCLOSURE_HTML = `
<div class="cozy-affiliate-disclosure" style="background:#f4ede2;border-left:4px solid #b28867;padding:14px 18px;margin:24px 0;border-radius:4px;font-size:0.92rem;color:#553c30;line-height:1.5;">
  <strong>Transparency Disclosure:</strong> Some of the links below are affiliate links. As an Amazon Associate, CozySpace earns from qualifying purchases if you choose to buy through these links, at zero additional cost to you. We only recommend pieces that elevate your cozy home!
</div>
`.trim();
