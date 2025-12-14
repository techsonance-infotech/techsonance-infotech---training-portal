import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { id } = await context.params;

        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Valid ID is required', code: 'INVALID_ID' },
                { status: 400 }
            );
        }

        // Check if topic exists
        const existingTopic = await db
            .select()
            .from(topics)
            .where(eq(topics.id, parseInt(id)))
            .limit(1);

        if (existingTopic.length === 0) {
            return NextResponse.json(
                { error: 'Topic not found' },
                { status: 404 }
            );
        }

        // Delete topic
        // Note: If you have child topics (sub-topics), you might want to handle recursive deletion 
        // or check constraints. For now, assuming direct deletion is fine or database handles constraints.
        await db
            .delete(topics)
            .where(eq(topics.id, parseInt(id)));

        return NextResponse.json(
            {
                message: 'Topic deleted successfully',
                id: parseInt(id),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('DELETE topic error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}
