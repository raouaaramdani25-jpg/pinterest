import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function removeGeneratedFile(imageUrl: string) {
  if (!imageUrl.startsWith('/generated/')) return;
  const generatedDir = path.resolve(process.cwd(), 'public', 'generated');
  const imagePath = path.resolve(process.cwd(), 'public', imageUrl.slice(1));
  if (imagePath.startsWith(`${generatedDir}${path.sep}`)) {
    return fs.unlink(imagePath).catch(() => undefined);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const previousUrl = String(formData.get('previousUrl') || '');

    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Please upload a valid image file.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image must be 10MB or smaller.' }, { status: 400 });
    }

    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'png';
    const filename = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const outputDir = path.join(process.cwd(), 'public', 'generated');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, filename), Buffer.from(await file.arrayBuffer()));
    await removeGeneratedFile(previousUrl);

    return NextResponse.json({
      success: true,
      imageUrl: `/generated/${filename}`,
      imageAiProvider: 'Manual upload',
      imageAiModel: 'User-provided image',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Image upload failed.' }, { status: 500 });
  }
}
