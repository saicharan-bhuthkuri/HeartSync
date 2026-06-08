import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Limit file size (e.g., 50MB for video uploads)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.name) || '.jpg';
    
    // Clean original name to prevent path traversal
    const safeName = file.name
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[^a-zA-Z0-9-_]/g, '_') // sanitize
      .substring(0, 50); // limit length

    const filename = `${safeName}-${uniqueSuffix}${ext}`;
    
    // Hybrid approach: if BLOB_READ_WRITE_TOKEN is defined, upload to Vercel Blob.
    // If we are on Vercel but the token is missing, return a clear error instead of failing on read-only local fs.
    if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Vercel Blob storage is not connected. Please go to your Vercel Project Dashboard -> Storage tab and create/connect a Blob store.' },
        { status: 400 }
      );
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${filename}`, file, {
          access: 'public',
          addRandomSuffix: false, // We already added a custom suffix
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError) {
        console.error('Vercel Blob upload failed, trying local fallback:', blobError);
      }
    }

    // Local file system fallback
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure uploads folder exists in public directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory already exists or was created concurrently
    }

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, new Uint8Array(buffer));

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
