const SESSION_COOKIE = 'cozyspace_dashboard_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(value: ArrayBuffer | string): string {
  const bytes = typeof value === 'string'
    ? new TextEncoder().encode(value)
    : new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return base64UrlEncode(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function createDashboardSession(username: string): Promise<string> {
  const secret = process.env.DASHBOARD_AUTH_SECRET;
  if (!secret) throw new Error('DASHBOARD_AUTH_SECRET is not configured.');
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${username}.${expiresAt}`;
  return `${base64UrlEncode(payload)}.${await sign(payload, secret)}`;
}

export async function verifyDashboardSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.DASHBOARD_AUTH_SECRET;
  if (!secret || !token) return false;
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  try {
    const payload = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const [username, expiresAt] = payload.split('.');
    if (!username || !expiresAt || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
    const expectedSignature = await sign(payload, secret);
    return expectedSignature === signature;
  } catch {
    return false;
  }
}

export function getSessionTtlSeconds(): number {
  return SESSION_TTL_SECONDS;
}
