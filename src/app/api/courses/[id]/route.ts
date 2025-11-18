import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const course = await db
      .select()
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
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, parseInt(id)))
      .limit(1);

    if (existingCourse.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate;
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate;
    }

    if (body.createdBy !== undefined) {
      updateData.createdBy = body.createdBy;
    }

    const updated = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, parseInt(id)))
      .limit(1);

    if (existingCourse.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    await db
      .delete(courses)
      .where(eq(courses.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Course deleted successfully',
        id: parseInt(id),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}