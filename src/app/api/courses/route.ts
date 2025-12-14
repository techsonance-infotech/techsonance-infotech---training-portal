import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single course by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          {
            error: "Valid ID is required",
            code: "INVALID_ID"
          },
          { status: 400 }
        );
      }

      const course = await db.select()
        .from(courses)
        .where(eq(courses.id, parseInt(id)))
        .limit(1);

      if (course.length === 0) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(course[0], { status: 200 });
    }

    // List courses with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(courses);

    if (search) {
      query = query.where(
        or(
          like(courses.title, `%${search}%`),
          like(courses.description, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

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
    const { title, description, startDate, endDate } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        {
          error: "Title is required and must be a non-empty string",
          code: "MISSING_TITLE"
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        {
          error: "Description is required and must be a non-empty string",
          code: "MISSING_DESCRIPTION"
        },
        { status: 400 }
      );
    }

    if (!startDate || typeof startDate !== 'string' || startDate.trim() === '') {
      return NextResponse.json(
        {
          error: "Start date is required",
          code: "MISSING_START_DATE"
        },
        { status: 400 }
      );
    }

    if (!endDate || typeof endDate !== 'string' || endDate.trim() === '') {
      return NextResponse.json(
        {
          error: "End date is required",
          code: "MISSING_END_DATE"
        },
        { status: 400 }
      );
    }

    // Create new course
    const currentTimestamp = new Date().toISOString();

    const newCourse = await db.insert(courses)
      .values({
        title: title.trim(),
        description: description.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        createdBy: currentUser.id,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .returning();

    return NextResponse.json(newCourse[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
