export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET current announcement bar settings (auto-creates default if none)
export async function GET() {
    try {
        let bar = await (prisma as any).announcementBar.findFirst()
        if (!bar) {
            bar = await (prisma as any).announcementBar.create({
                data: {
                    text: '🎉 Free shipping on orders above ₹999!',
                    isVisible: true,
                    bgColor: '#1a1a1a',
                    textColor: '#d4af37',
                },
            })
        }
        return NextResponse.json(bar)
    } catch (error) {
        console.error('Announcement GET error:', error)
        return NextResponse.json({ error: 'Failed to load announcement bar' }, { status: 500 })
    }
}

// PATCH – update announcement bar settings
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { text, link, linkText, bgColor, textColor, isVisible } = body

        // Get existing record
        let bar = await (prisma as any).announcementBar.findFirst()

        if (!bar) {
            bar = await (prisma as any).announcementBar.create({
                data: {
                    text: text ?? '🎉 Free shipping on orders above ₹999!',
                    link: link ?? null,
                    linkText: linkText ?? null,
                    bgColor: bgColor ?? '#1a1a1a',
                    textColor: textColor ?? '#d4af37',
                    isVisible: isVisible ?? true,
                },
            })
        } else {
            bar = await (prisma as any).announcementBar.update({
                where: { id: bar.id },
                data: {
                    ...(text !== undefined && { text }),
                    ...(link !== undefined && { link }),
                    ...(linkText !== undefined && { linkText }),
                    ...(bgColor !== undefined && { bgColor }),
                    ...(textColor !== undefined && { textColor }),
                    ...(isVisible !== undefined && { isVisible }),
                },
            })
        }

        return NextResponse.json(bar)
    } catch (error) {
        console.error('Announcement PATCH error:', error)
        return NextResponse.json({ error: 'Failed to update announcement bar' }, { status: 500 })
    }
}
