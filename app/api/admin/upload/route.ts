export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 8 * 1024 * 1024 // 8MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = (formData.get('folder') as string) || 'hero'

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Only JPG, PNG, WebP allowed.' },
                { status: 400 }
            )
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { success: false, error: `File too large. Max 8MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // ── Try Cloudinary first (if configured) ────────────────────────────
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
            try {
                const { uploadToCloudinary } = await import('@/lib/cloudinary')
                const result = await uploadToCloudinary(buffer, file.name, `glanzoo/${folder}`)
                return NextResponse.json({
                    success: true,
                    url: result.secure_url,
                    publicId: result.public_id,
                })
            } catch (err) {
                console.warn('Cloudinary upload failed, falling back to local:', err)
            }
        }

        // ── Local fallback (Docker volume mounts /app/public/uploads) ───────
        const safeName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_{2,}/g, '_')
            .slice(0, 80)
        const filename = `${Date.now()}-${safeName}`
        const uploadDir = join(process.cwd(), 'public', 'uploads', folder)

        await mkdir(uploadDir, { recursive: true })
        await writeFile(join(uploadDir, filename), buffer)

        return NextResponse.json({
            success: true,
            url: `/uploads/${folder}/${filename}`,
            filename,
        })
    } catch (error) {
        console.error('Admin upload error:', error)
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
    }
}
