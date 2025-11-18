import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activities } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

const VALID_ACTIVITY_TYPES = ['overview', 'discussion', 'practical', 'review'] as const;

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const courseId = context.params.id;

    // Validate course ID
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        { 
          error: 'Valid course ID is required',
          code: 'INVALID_COURSE_ID' 
        },
        { status: 400 }
      );
    }

    const parsedCourseId = parseInt(courseId);

    // Get all activities for the course, ordered by scheduled date
    const courseActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.courseId, parsedCourseId))
      .orderBy(asc(activities.scheduledDate));

    return NextResponse.json(courseActivities, { status: 200 });
  } catch (error) {
    console.error('GET activities error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const courseId = context.params.id;

    // Validate course ID
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        { 
          error: 'Valid course ID is required',
          code: 'INVALID_COURSE_ID' 
        },
        { status: 400 }
      );
    }

    const parsedCourseId = parseInt(courseId);

    // Parse request body
    const body = await request.json();
    const { title, type, description, scheduledDate } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Title is required and must be a non-empty string',
          code: 'MISSING_TITLE' 
        },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { 
          error: 'Type is required',
          code: 'MISSING_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate type is one of the allowed values
    if (!VALID_ACTIVITY_TYPES.includes(type as typeof VALID_ACTIVITY_TYPES[number])) {
      return NextResponse.json(
        { 
          error: `Type must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`,
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Description is required and must be a non-empty string',
          code: 'MISSING_DESCRIPTION' 
        },
        { status: 400 }
      );
    }

    if (!scheduledDate || typeof scheduledDate !== 'string' || scheduledDate.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Scheduled date is required and must be a valid ISO timestamp',
          code: 'MISSING_SCHEDULED_DATE' 
        },
        { status: 400 }
      );
    }

    // Create new activity
    const newActivity = await db
      .insert(activities)
      .values({
        courseId: parsedCourseId,
        title: title.trim(),
        type: type.trim(),
        description: description.trim(),
        scheduledDate: scheduledDate.trim(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error('POST activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}