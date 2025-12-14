import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseAssignments } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    // Default to current user if no specific userId requested
    // If requesting for another user, ensure admin role (optional, but good practice)
    const targetUserId = userIdParam || currentUser.id;

    // TODO: Add role check here if allowing admins to view others' assignments
    // For now, if employee, force viewing own assignments
    const effectiveUserId = currentUser.role === 'admin' ? targetUserId : currentUser.id;

    let query = db.select().from(courseAssignments);

    if (effectiveUserId) {
      query = query.where(eq(courseAssignments.userId, effectiveUserId));
    }

    const assignments = await query.orderBy(desc(courseAssignments.assignedAt));

    return NextResponse.json(assignments, { status: 200 });
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, status, progress } = body;

    if (!courseId) {
      return NextResponse.json(
        {
          error: 'courseId is required',
          code: 'MISSING_COURSE_ID'
        },
        { status: 400 }
      );
    }

    const courseIdInt = parseInt(courseId);
    if (isNaN(courseIdInt)) {
      return NextResponse.json(
        {
          error: 'courseId must be a valid integer',
          code: 'INVALID_COURSE_ID'
        },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existing = await db.select().from(courseAssignments).where(
      and(
        eq(courseAssignments.userId, currentUser.id),
        eq(courseAssignments.courseId, courseIdInt)
      )
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Assignment already exists' }, { status: 409 });
    }

    const newAssignment = await db.insert(courseAssignments)
      .values({
        courseId: courseIdInt,
        userId: currentUser.id,
        progress: progress || 0,
        status: status || 'not_started',
        assignedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : null,
      })
      .returning();

    return NextResponse.json(newAssignment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, status, progress } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const courseIdInt = parseInt(courseId);
    if (isNaN(courseIdInt)) {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 });
    }

    // Validate Status
    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (status === 'completed') updateData.completedAt = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    const updatedAssignment = await db
      .update(courseAssignments)
      .set(updateData)
      .where(
        and(
          eq(courseAssignments.userId, currentUser.id),
          eq(courseAssignments.courseId, courseIdInt)
        )
      )
      .returning();

    if (updatedAssignment.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAssignment[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}