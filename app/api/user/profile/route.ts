export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { name, phone } = await request.json();
        await db.update(users).set({ name, phone }).where(eq(users.email, session.user.email));
        const [updatedUser] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone })
            .from(users).where(eq(users.email, session.user.email)).limit(1);
        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
