import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewNotifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid notification ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    // Check if notification exists and belongs to current user
    const existingNotification = await db
      .select()
      .from(reviewNotifications)
      .where(
        and(
          eq(reviewNotifications.id, notificationId),
          eq(reviewNotifications.userId, user.id)
        )
      )
      .limit(1);

    if (existingNotification.length === 0) {
      // Check if notification exists at all
      const notificationExists = await db
        .select()
        .from(reviewNotifications)
        .where(eq(reviewNotifications.id, notificationId))
        .limit(1);

      if (notificationExists.length === 0) {
        return NextResponse.json(
          { error: 'Notification not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      // Notification exists but doesn't belong to user
      return NextResponse.json(
        {
          error: 'You do not have permission to access this notification',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Update notification to mark as read
    const updated = await db
      .update(reviewNotifications)
      .set({
        isRead: true,
      })
      .where(
        and(
          eq(reviewNotifications.id, notificationId),
          eq(reviewNotifications.userId, user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update notification', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT /api/reviews/notifications/[id]/read error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}