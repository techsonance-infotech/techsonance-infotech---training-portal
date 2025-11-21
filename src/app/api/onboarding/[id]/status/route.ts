import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employeeOnboarding, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'in_review', 'approved', 'rejected'] as const;
type ValidStatus = typeof VALID_STATUSES[number];

const VALID_TRANSITIONS: Record<ValidStatus, ValidStatus[]> = {
  'pending': ['in_review', 'approved', 'rejected'],
  'in_review': ['approved', 'rejected', 'pending'],
  'approved': [], // Immutable - no transitions allowed
  'rejected': ['pending'], // Allow resubmission
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const submissionId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { status, reviewerId, comment } = body;

    // Validate status is provided
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required', code: 'MISSING_STATUS' },
        { status: 400 }
      );
    }

    // Validate status is one of valid values
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Fetch existing submission
    const existingSubmission = await db
      .select()
      .from(employeeOnboarding)
      .where(eq(employeeOnboarding.id, submissionId))
      .limit(1);

    if (existingSubmission.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found', code: 'SUBMISSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentSubmission = existingSubmission[0];
    const currentStatus = currentSubmission.status as ValidStatus;

    // Check if submission is approved (immutable)
    if (currentStatus === 'approved') {
      return NextResponse.json(
        { 
          error: 'Cannot modify approved submission. Approved submissions are immutable.',
          code: 'APPROVED_IMMUTABLE' 
        },
        { status: 400 }
      );
    }

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
          code: 'INVALID_TRANSITION' 
        },
        { status: 400 }
      );
    }

    // Validate reviewerId is required when approving or rejecting
    if ((status === 'approved' || status === 'rejected') && !reviewerId) {
      return NextResponse.json(
        { 
          error: 'Reviewer ID is required when approving or rejecting',
          code: 'REVIEWER_REQUIRED' 
        },
        { status: 400 }
      );
    }

    // Validate reviewer exists if reviewerId is provided
    if (reviewerId) {
      const reviewer = await db
        .select()
        .from(user)
        .where(eq(user.id, reviewerId))
        .limit(1);

      if (reviewer.length === 0) {
        return NextResponse.json(
          { error: 'Reviewer user not found', code: 'REVIEWER_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Set reviewedBy and reviewedAt when approving or rejecting
    if (status === 'approved' || status === 'rejected') {
      updateData.reviewedBy = reviewerId;
      updateData.reviewedAt = new Date().toISOString();
    }

    // Add comment if provided
    if (comment) {
      updateData.reviewerComment = comment;
    }

    // Update submission
    const updatedSubmission = await db
      .update(employeeOnboarding)
      .set(updateData)
      .where(eq(employeeOnboarding.id, submissionId))
      .returning();

    if (updatedSubmission.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update submission', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    // Fetch reviewer details if reviewedBy exists
    let reviewerDetails = null;
    if (updatedSubmission[0].reviewedBy) {
      const reviewerData = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, updatedSubmission[0].reviewedBy))
        .limit(1);

      if (reviewerData.length > 0) {
        reviewerDetails = reviewerData[0];
      }
    }

    // Return updated submission with reviewer details
    return NextResponse.json({
      ...updatedSubmission[0],
      reviewer: reviewerDetails,
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH /api/onboarding/[id]/status error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}