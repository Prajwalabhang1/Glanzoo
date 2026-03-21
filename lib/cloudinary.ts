/**
 * FIX-21: Cloudinary upload service.
 * Uses Cloudinary's REST API with signed uploads.
 * No extra npm package needed — uses native fetch + FormData.
 * 
 * Setup: Add to .env:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 */

import crypto from 'crypto';

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
}

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer - File contents as Buffer
 * @param filename - Original filename (used to determine format)
 * @param folder - Cloudinary folder to upload to (e.g. 'products', 'banners')
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    filename: string,
    folder = 'glanzoo'
): Promise<CloudinaryUploadResult> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary credentials not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    }

    // Generate signed upload parameters
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `${folder}/${Date.now()}-${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;

    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
        .createHash('sha256')
        .update(paramsToSign + apiSecret)
        .digest('hex');

    // Build multipart form data
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)]);
    formData.append('file', blob, filename);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', publicId);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`Cloudinary upload failed: ${error.error?.message || response.statusText}`);
    }

    return response.json() as Promise<CloudinaryUploadResult>;
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) return;

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
        .createHash('sha256')
        .update(paramsToSign + apiSecret)
        .digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        { method: 'POST', body: formData }
    );
}
