import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function getStoredSettings() {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch {}
  }
  return {
    wpSiteUrl: process.env.WP_SITE_URL || 'https://cozyspace.company',
    wpUsername: process.env.WP_USERNAME || 'CozySpaceApp',
    wpAppPassword: process.env.WP_APP_PASSWORD || 'WfSP R4rl v3Aq DDaD jksn Iy2l',
    amazonTag: process.env.AMAZON_TAG || 'cozyplace04-20',
  };
}

export async function GET() {
  return NextResponse.json({ success: true, settings: getStoredSettings() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getStoredSettings();
    const updated = {
      wpSiteUrl: (body.wpSiteUrl || current.wpSiteUrl || '').trim(),
      wpUsername: (body.wpUsername || current.wpUsername || '').trim(),
      wpAppPassword: (body.wpAppPassword || current.wpAppPassword || '').trim(),
      amazonTag: (body.amazonTag || current.amazonTag || 'cozyplace04-20').trim(),
    };

    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
