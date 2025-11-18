import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { topics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const courseId = context.params.id;

    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        {
          error: 'Valid course ID is required',
          code: 'INVALID_COURSE_ID',
        },
        { status: 400 }
      );
    }

    const courseTopics = await db
      .select()
      .from(topics)
      .where(eq(topics.courseId, parseInt(courseId)))
      .orderBy(asc(topics.orderIndex));

    return NextResponse.json(courseTopics, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
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

    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        {
          error: 'Valid course ID is required',
          code: 'INVALID_COURSE_ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, orderIndex, videoUrl, attachmentUrl } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        {
          error: 'Title is required and must be a non-empty string',
          code: 'INVALID_TITLE',
        },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        {
          error: 'Content is required and must be a non-empty string',
          code: 'INVALID_CONTENT',
        },
        { status: 400 }
      );
    }

    if (orderIndex === undefined || orderIndex === null || isNaN(parseInt(orderIndex))) {
      return NextResponse.json(
        {
          error: 'Order index is required and must be an integer',
          code: 'INVALID_ORDER_INDEX',
        },
        { status: 400 }
      );
    }

    const newTopic = await db
      .insert(topics)
      .values({
        courseId: parseInt(courseId),
        title: title.trim(),
        content: content.trim(),
        orderIndex: parseInt(orderIndex),
        videoUrl: videoUrl?.trim() || null,
        attachmentUrl: attachmentUrl?.trim() || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTopic[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}