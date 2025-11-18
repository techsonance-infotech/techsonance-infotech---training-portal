import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedbackRequests } from '@/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = db.select().from(feedbackRequests);

    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json(
          { 
            error: 'Valid user ID is required',
            code: 'INVALID_USER_ID' 
          },
          { status: 400 }
        );
      }

      query = query.where(
        or(
          eq(feedbackRequests.requesterId, userIdInt),
          eq(feedbackRequests.reviewerId, userIdInt)
        )
      );
    }

    const results = await query.orderBy(desc(feedbackRequests.createdAt));

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
    const body = await request.json();
    const { requesterId, reviewerId, year } = body;

    // Validate required fields
    if (!requesterId) {
      return NextResponse.json(
        { 
          error: 'Requester ID is required',
          code: 'MISSING_REQUESTER_ID' 
        },
        { status: 400 }
      );
    }

    if (!reviewerId) {
      return NextResponse.json(
        { 
          error: 'Reviewer ID is required',
          code: 'MISSING_REVIEWER_ID' 
        },
        { status: 400 }
      );
    }

    if (!year) {
      return NextResponse.json(
        { 
          error: 'Year is required',
          code: 'MISSING_YEAR' 
        },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof requesterId !== 'number' || !Number.isInteger(requesterId)) {
      return NextResponse.json(
        { 
          error: 'Requester ID must be a valid integer',
          code: 'INVALID_REQUESTER_ID' 
        },
        { status: 400 }
      );
    }

    if (typeof reviewerId !== 'number' || !Number.isInteger(reviewerId)) {
      return NextResponse.json(
        { 
          error: 'Reviewer ID must be a valid integer',
          code: 'INVALID_REVIEWER_ID' 
        },
        { status: 400 }
      );
    }

    if (typeof year !== 'number' || !Number.isInteger(year)) {
      return NextResponse.json(
        { 
          error: 'Year must be a valid integer',
          code: 'INVALID_YEAR' 
        },
        { status: 400 }
      );
    }

    // Create feedback request
    const newFeedbackRequest = await db.insert(feedbackRequests)
      .values({
        requesterId,
        reviewerId,
        year,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFeedbackRequest[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}