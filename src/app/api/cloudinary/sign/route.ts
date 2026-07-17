import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'wdsepioa';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '738718397121653';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '82aR0CVjurkjAm-bVi6bgXFe9jo';

export async function POST(req: NextRequest) {
  try {
    const { folder } = await req.json();

    const timestamp = Math.round(Date.now() / 1000);
    const folderToSign = folder || 'jogjagem/profiles';

    const paramsToSign = `folder=${folderToSign}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      api_key: CLOUDINARY_API_KEY,
      cloud_name: CLOUDINARY_CLOUD_NAME,
      folder: folderToSign,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to sign' }, { status: 500 });
  }
}
