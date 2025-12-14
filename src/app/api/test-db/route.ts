
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const start = Date.now();
        // Simple query
        const count = await db.select().from(users).limit(1);
        const duration = Date.now() - start;

        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(10);

        return NextResponse.json({
            status: "connected",
            message: "Database connection successful",
            recentUsers: allUsers.map(u => ({ email: u.email, status: u.status, role: u.role, id: u.id }))
        });
    } catch (error) {
        console.error('Test DB Error:', error);
        return NextResponse.json({
            status: 'error',
            message: (error as Error).message,
            stack: (error as Error).stack
        }, { status: 500 });
    }
}
