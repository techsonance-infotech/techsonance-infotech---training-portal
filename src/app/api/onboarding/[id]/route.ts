import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employeeOnboarding, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Fetch submission
    const submission = await db
      .select()
      .from(employeeOnboarding)
      .where(eq(employeeOnboarding.id, parseInt(id)))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const result = submission[0];
    
    // Get reviewer details if reviewedBy exists
    let reviewerDetails = null;
    if (result.reviewedBy) {
      const reviewer = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, result.reviewedBy))
        .limit(1);

      if (reviewer.length > 0) {
        reviewerDetails = reviewer[0];
      }
    }

    const response = {
      ...result,
      reviewer: reviewerDetails,
    };

    return NextResponse.json(response, { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existing = await db
      .select()
      .from(employeeOnboarding)
      .where(eq(employeeOnboarding.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Prevent updating protected fields
    const protectedFields = ['id', 'createdAt', 'submittedAt'];
    for (const field of protectedFields) {
      if (field in body) {
        delete body[field];
      }
    }

    // Always update updatedAt
    body.updatedAt = new Date().toISOString();

    // Update the submission
    const updated = await db
      .update(employeeOnboarding)
      .set(body)
      .where(eq(employeeOnboarding.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update submission', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existing = await db
      .select()
      .from(employeeOnboarding)
      .where(eq(employeeOnboarding.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if deletion is allowed
    const status = existing[0].status;
    if (status !== 'pending' && status !== 'rejected') {
      return NextResponse.json(
        { 
          error: 'Cannot delete submission with status: ' + status + '. Only pending or rejected submissions can be deleted.', 
          code: 'DELETE_NOT_ALLOWED' 
        },
        { status: 400 }
      );
    }

    // Delete the submission
    const deleted = await db
      .delete(employeeOnboarding)
      .where(eq(employeeOnboarding.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete submission', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Submission deleted successfully',
        deletedSubmission: deleted[0],
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