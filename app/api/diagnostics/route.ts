import { NextResponse } from 'next/server';
import net from 'net';

export const dynamic = 'force-dynamic';

export async function GET() {
    return new Promise((resolve) => {
        const host = 'aws-1-ap-northeast-1.pooler.supabase.com';
        const port = 6543;
        
        const startTime = Date.now();
        const socket = new net.Socket();
        socket.setTimeout(5000);

        socket.connect(port, host, () => {
            socket.destroy();
            resolve(NextResponse.json({
                status: 'success',
                message: `Successfully connected to ${host}:${port} in ${Date.now() - startTime}ms`,
                firewall: 'OPEN'
            }));
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(NextResponse.json({
                status: 'error',
                message: `Connection timed out after 5000ms. Hostinger firewall is blocking port ${port}!`,
                firewall: 'BLOCKED_TIMEOUT'
            }));
        });

        socket.on('error', (err) => {
            socket.destroy();
            resolve(NextResponse.json({
                status: 'error',
                message: `Connection explicitly refused or failed: ${err.message}`,
                firewall: 'BLOCKED_ERROR',
                code: err.name
            }));
        });
    });
}
