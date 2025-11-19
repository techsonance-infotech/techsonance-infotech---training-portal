import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewComments, reviewForms, user } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check - only admin, hr, and manager roles allowed
    if (!['admin', 'hr', 'manager'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admin, HR, or manager role required.' },
        { status: 403 }
      );
    }

    // Validate form ID
    const formId = parseInt(params.id);
    if (isNaN(formId)) {
      return NextResponse.json(
        { error: 'Valid form ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if form exists
    const form = await db
      .select()
      .from(reviewForms)
      .where(eq(reviewForms.id, formId))
      .limit(1);

    if (form.length === 0) {
      return NextResponse.json(
        { error: 'Review form not found', code: 'FORM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get all comments for the form with commenter details
    const comments = await db
      .select({
        id: reviewComments.id,
        formId: reviewComments.formId,
        commenterId: reviewComments.commenterId,
        commenterRole: reviewComments.commenterRole,
        comment: reviewComments.comment,
        createdAt: reviewComments.createdAt,
        commenterName: user.name,
        commenterEmail: user.email,
      })
      .from(reviewComments)
      .leftJoin(user, eq(reviewComments.commenterId, user.id))
      .where(eq(reviewComments.formId, formId))
      .orderBy(asc(reviewComments.createdAt));

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Authorization check - only admin, hr, and manager roles allowed
    if (!['admin', 'hr', 'manager'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admin, HR, or manager role required.' },
        { status: 403 }
      );
    }

    // Validate form ID
    const formId = parseInt(params.id);
    if (isNaN(formId)) {
      return NextResponse.json(
        { error: 'Valid form ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { comment } = body;

    // Validate comment is not empty
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required and cannot be empty', code: 'COMMENT_REQUIRED' },
        { status: 400 }
      );
    }

    // Check if form exists
    const form = await db
      .select()
      .from(reviewForms)
      .where(eq(reviewForms.id, formId))
      .limit(1);

    if (form.length === 0) {
      return NextResponse.json(
        { error: 'Review form not found', code: 'FORM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create new comment
    const newComment = await db
      .insert(reviewComments)
      .values({
        formId,
        commenterId: currentUser.id,
        commenterRole: currentUser.role,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Get commenter details
    const commenterDetails = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    // Combine comment with commenter details
    const responseData = {
      ...newComment[0],
      commenterName: commenterDetails[0]?.name || null,
      commenterEmail: commenterDetails[0]?.email || null,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}