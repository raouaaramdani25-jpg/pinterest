import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const imageUrl = new URL(request.url).searchParams.get('url');
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json({ error: 'A valid image URL is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: { Accept: 'image/*' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'The source image could not be loaded.' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] || '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'The source URL is not an image.' }, { status: 415 });
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Type': contentType,
      },
    });
  } catch {
    return NextResponse.json({ error: 'The source image could not be loaded.' }, { status: 502 });
  }
}
