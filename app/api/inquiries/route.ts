export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, phone, subject, message } = body

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create inquiry in database
        const inquiry = await prisma.inquiry.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject,
                message,
                status: 'NEW',
            },
        })

        return NextResponse.json({ success: true, inquiry }, { status: 201 })
    } catch (error) {
        console.error('Error creating inquiry:', error)
        return NextResponse.json(
            { error: 'Failed to create inquiry' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const inquiries = await prisma.inquiry.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ inquiries })
    } catch (error) {
        console.error('Error fetching inquiries:', error)
        return NextResponse.json(
            { error: 'Failed to fetch inquiries' },
            { status: 500 }
        )
    }
}
