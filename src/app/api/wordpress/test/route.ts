import { NextResponse } from 'next/server';
import { getBasicAuthHeader } from '@/lib/wordpress';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const siteUrl = (body.siteUrl || process.env.WP_SITE_URL || 'https://cozyspace.company').replace(/\/+$/, '');
    const username = body.username || process.env.WP_USERNAME || 'CozySpaceApp';
    const appPassword = body.appPassword || process.env.WP_APP_PASSWORD || '';

    const authHeader = getBasicAuthHeader(username, appPassword);

    // Test endpoint: /wp-json/wp/v2/users/me verifies both URL and Application Password
    const testUrl = `${siteUrl}/wp-json/wp/v2/users/me`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json({
        success: true,
        authenticated: true,
        message: `Successfully connected to ${siteUrl}! Authenticated as "${userData.name || username}" (User ID: ${userData.id}).`,
        user: {
          id: userData.id,
          name: userData.name,
          slug: userData.slug,
        },
      });
    }

    // If 401 or 403, credentials issue
    if (response.status === 401 || response.status === 403) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        status: response.status,
        error: `Authentication failed (Status ${response.status}). Please check your WordPress Username and Application Password.`,
      });
    }

    // Try fallback to check if site itself is reachable
    const siteInfoRes = await fetch(`${siteUrl}/wp-json/`);
    if (siteInfoRes.ok) {
      const siteInfo = await siteInfoRes.json();
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: `WordPress REST API reached (${siteInfo.name}), but user authentication failed. Please confirm the Username and Application Password.`,
      });
    }

    return NextResponse.json({
      success: false,
      error: `Could not reach WordPress at ${siteUrl}. Status: ${response.status}`,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Network error connecting to WordPress: ${err.message}`,
    });
  }
}
