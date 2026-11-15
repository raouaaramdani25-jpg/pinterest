import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Please upload a valid image file.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image must be 10MB or smaller.' }, { status: 400 });
    }

    const imageData = Buffer.from(await file.arrayBuffer()).toString('base64');

    return NextResponse.json({
      success: true,
      imageUrl: `data:${file.type};base64,${imageData}`,
      imageAiProvider: 'Manual upload',
      imageAiModel: 'User-provided image',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Image upload failed.' }, { status: 500 });
  }
}
