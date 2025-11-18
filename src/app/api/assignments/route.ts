import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courseAssignments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = db.select().from(courseAssignments);

    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json(
          { 
            error: 'Invalid userId parameter',
            code: 'INVALID_USER_ID' 
          },
          { status: 400 }
        );
      }
      query = query.where(eq(courseAssignments.userId, userIdInt));
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
    const body = await request.json();
    const { courseId, userId } = body;

    if (!courseId) {
      return NextResponse.json(
        { 
          error: 'courseId is required',
          code: 'MISSING_COURSE_ID' 
        },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const courseIdInt = parseInt(courseId);
    const userIdInt = parseInt(userId);

    if (isNaN(courseIdInt)) {
      return NextResponse.json(
        { 
          error: 'courseId must be a valid integer',
          code: 'INVALID_COURSE_ID' 
        },
        { status: 400 }
      );
    }

    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    const newAssignment = await db.insert(courseAssignments)
      .values({
        courseId: courseIdInt,
        userId: userIdInt,
        progress: 0,
        status: 'not_started',
        assignedAt: new Date().toISOString(),
        completedAt: null,
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