import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewNotifications, user } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_NOTIFICATION_TYPES = [
  'review_requested',
  'review_submitted',
  'draft_saved',
  'cycle_completed',
  'reminder'
] as const;

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isReadParam = searchParams.get('isRead');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let whereConditions = [eq(reviewNotifications.userId, currentUser.id)];

    if (isReadParam !== null) {
      const isRead = isReadParam === 'true';
      whereConditions.push(eq(reviewNotifications.isRead, isRead));
    }

    const notifications = await db
      .select()
      .from(reviewNotifications)
      .where(and(...whereConditions))
      .orderBy(desc(reviewNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, notificationType, title, message, relatedId } = body;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (!notificationType || typeof notificationType !== 'string') {
      return NextResponse.json(
        { error: 'notificationType is required', code: 'MISSING_NOTIFICATION_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_NOTIFICATION_TYPES.includes(notificationType as any)) {
      return NextResponse.json(
        {
          error: `Invalid notificationType. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
          code: 'INVALID_NOTIFICATION_TYPE'
        },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and cannot be empty', code: 'INVALID_TITLE' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty', code: 'INVALID_MESSAGE' },
        { status: 400 }
      );
    }

    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    const newNotification = await db
      .insert(reviewNotifications)
      .values({
        userId: userId.trim(),
        notificationType: notificationType.trim(),
        title: title.trim(),
        message: message.trim(),
        relatedId: relatedId !== undefined && relatedId !== null ? parseInt(relatedId) : null,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}