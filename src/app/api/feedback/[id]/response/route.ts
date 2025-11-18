import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedbackRequests, feedbackResponses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid feedback request ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const requestId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { rating, skillsEvaluation, comments } = body;

    // Validate required fields
    if (rating === undefined || rating === null) {
      return NextResponse.json(
        {
          error: 'Rating is required',
          code: 'MISSING_RATING',
        },
        { status: 400 }
      );
    }

    if (!skillsEvaluation || typeof skillsEvaluation !== 'string' || skillsEvaluation.trim() === '') {
      return NextResponse.json(
        {
          error: 'Skills evaluation is required and must be a non-empty string',
          code: 'MISSING_SKILLS_EVALUATION',
        },
        { status: 400 }
      );
    }

    if (!comments || typeof comments !== 'string' || comments.trim() === '') {
      return NextResponse.json(
        {
          error: 'Comments are required and must be a non-empty string',
          code: 'MISSING_COMMENTS',
        },
        { status: 400 }
      );
    }

    // Validate rating is between 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        {
          error: 'Rating must be an integer between 1 and 5',
          code: 'INVALID_RATING',
        },
        { status: 400 }
      );
    }

    // Verify feedback request exists
    const existingRequest = await db
      .select()
      .from(feedbackRequests)
      .where(eq(feedbackRequests.id, requestId))
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json(
        {
          error: 'Feedback request not found',
          code: 'REQUEST_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const currentTimestamp = new Date().toISOString();

    // Create feedback response
    const newResponse = await db
      .insert(feedbackResponses)
      .values({
        requestId,
        rating: ratingNum,
        skillsEvaluation: skillsEvaluation.trim(),
        comments: comments.trim(),
        submittedAt: currentTimestamp,
      })
      .returning();

    // Update feedback request status to 'completed'
    await db
      .update(feedbackRequests)
      .set({
        status: 'completed',
      })
      .where(eq(feedbackRequests.id, requestId));

    return NextResponse.json(newResponse[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}