export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// FIX-5: Secure file upload with authentication, validation, and Cloudinary storage
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        // FIX-5a: Require ADMIN or VENDOR role to upload files
        const session = await auth();
        if (!session || !['ADMIN', 'VENDOR'].includes(session.user?.role || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const folder = (data.get('folder') as string) || 'glanzoo/products';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // FIX-5b: Validate file MIME type (not just extension)
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: JPEG, PNG, WebP, GIF` },
                { status: 400 }
            );
        }

        // FIX-5c: Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: `File too large. Maximum size is 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // FIX-5d: Upload to Cloudinary instead of local disk
        // Falls back to local upload if Cloudinary is not configured
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await uploadToCloudinary(buffer, file.name, folder);
            return NextResponse.json({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
            });
        }

        // Fallback: local disk upload (development only)
        const { writeFile, mkdir } = await import('fs/promises');
        const { join } = await import('path');

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
        await mkdir(uploadDir, { recursive: true });

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const safeBasename = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .slice(0, 50);
        const filename = `${safeBasename}-${uniqueSuffix}.${ext}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        return NextResponse.json({ url: `/uploads/products/${filename}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
