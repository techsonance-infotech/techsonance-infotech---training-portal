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

    // Get all topics for the course (flat array)
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
    const { title, content, orderIndex, orderNumber, videoUrl, attachmentUrl, parentTopicId } = body;

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

    if (orderNumber === undefined || orderNumber === null || isNaN(parseInt(orderNumber))) {
      return NextResponse.json(
        {
          error: 'Order number is required and must be an integer',
          code: 'INVALID_ORDER_NUMBER',
        },
        { status: 400 }
      );
    }

    // Validate parentTopicId if provided
    if (parentTopicId !== undefined && parentTopicId !== null) {
      const parentTopicIdInt = parseInt(parentTopicId);
      if (isNaN(parentTopicIdInt)) {
        return NextResponse.json(
          {
            error: 'Parent topic ID must be a valid integer',
            code: 'INVALID_PARENT_TOPIC_ID',
          },
          { status: 400 }
        );
      }

      // Check if parent topic exists and belongs to same course
      const parentTopic = await db
        .select()
        .from(topics)
        .where(eq(topics.id, parentTopicIdInt))
        .limit(1);

      if (parentTopic.length === 0) {
        return NextResponse.json(
          {
            error: 'Parent topic not found',
            code: 'PARENT_TOPIC_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (parentTopic[0].courseId !== parseInt(courseId)) {
        return NextResponse.json(
          {
            error: 'Parent topic must belong to the same course',
            code: 'PARENT_TOPIC_COURSE_MISMATCH',
          },
          { status: 400 }
        );
      }
    }

    const newTopic = await db
      .insert(topics)
      .values({
        courseId: parseInt(courseId),
        title: title.trim(),
        content: content.trim(),
        orderIndex: parseInt(orderIndex),
        orderNumber: parseInt(orderNumber),
        videoUrl: videoUrl?.trim() || null,
        attachmentUrl: attachmentUrl?.trim() || null,
        parentTopicId: parentTopicId ? parseInt(parentTopicId) : null,
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