export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, phone } = body

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                phone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
        })

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser,
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
