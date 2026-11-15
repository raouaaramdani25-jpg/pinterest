import { NextResponse } from 'next/server';
import {
  createDashboardSession,
  getSessionCookieName,
  getSessionTtlSeconds,
} from '@/lib/dashboard-auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const configuredUsername = process.env.DASHBOARD_USERNAME;
    const configuredPassword = process.env.DASHBOARD_PASSWORD;

    if (!configuredUsername || !configuredPassword || !process.env.DASHBOARD_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Dashboard authentication is not configured.' },
        { status: 503 }
      );
    }

    if (username !== configuredUsername || password !== configuredPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const token = await createDashboardSession(configuredUsername);
    const response = NextResponse.json({ success: true });
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: getSessionTtlSeconds(),
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid login request.' }, { status: 400 });
  }
}
