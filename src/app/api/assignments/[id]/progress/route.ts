import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseAssignments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Validate ID is a valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid assignment ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const assignmentId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { progress } = body;

    // Validate progress is provided
    if (progress === undefined || progress === null) {
      return NextResponse.json(
        {
          error: 'Progress is required',
          code: 'MISSING_PROGRESS',
        },
        { status: 400 }
      );
    }

    // Validate progress is an integer
    if (typeof progress !== 'number' || !Number.isInteger(progress)) {
      return NextResponse.json(
        {
          error: 'Progress must be an integer',
          code: 'INVALID_PROGRESS_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        {
          error: 'Progress must be between 0 and 100',
          code: 'INVALID_PROGRESS_RANGE',
        },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await db
      .select()
      .from(courseAssignments)
      .where(eq(courseAssignments.id, assignmentId))
      .limit(1);

    if (existingAssignment.length === 0) {
      return NextResponse.json(
        {
          error: 'Assignment not found',
          code: 'ASSIGNMENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Determine status based on progress
    let status: 'not_started' | 'in_progress' | 'completed';
    let completedAt: string | null = null;

    if (progress === 0) {
      status = 'not_started';
      completedAt = null;
    } else if (progress > 0 && progress < 100) {
      status = 'in_progress';
      completedAt = null;
    } else {
      // progress === 100
      status = 'completed';
      completedAt = new Date().toISOString();
    }

    // Update assignment with new progress, status, and completedAt
    const updated = await db
      .update(courseAssignments)
      .set({
        progress,
        status,
        completedAt,
      })
      .where(eq(courseAssignments.id, assignmentId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}