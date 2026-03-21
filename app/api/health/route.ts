export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// FIX-20: Health check endpoint for Docker, load balancers, and monitoring
export async function GET() {
    const timestamp = new Date().toISOString();

    try {
        // Verify database connectivity with a lightweight ping
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json(
            {
                status: 'ok',
                db: 'connected',
                timestamp,
                version: process.env.npm_package_version || '0.1.0',
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                db: 'disconnected',
                timestamp,
            },
            {
                status: 503,
                headers: {
                    'Cache-Control': 'no-store',
                },
            }
        );
    }
}
