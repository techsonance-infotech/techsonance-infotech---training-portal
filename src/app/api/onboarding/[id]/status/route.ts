import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employeeOnboarding, users, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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
        .from(users)
        .where(eq(users.id, reviewerId))
        .limit(1);

      if (reviewer.length === 0) {
        return NextResponse.json(
          { error: 'Reviewer user not found', code: 'REVIEWER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    // Start a transaction
    const transactionResult = await db.transaction(async (tx) => {
      // Update onboarding status
      const updatedSubmission = await tx.update(employeeOnboarding)
        .set({
          status: status as any,
          reviewedBy: reviewerId || null,
          reviewedAt: (status === 'approved' || status === 'rejected') ? now.toISOString() : null,
          updatedAt: now.toISOString(),
        })
        .where(eq(employeeOnboarding.id, parseInt(id)))
        .returning();

      if (!updatedSubmission || updatedSubmission.length === 0) {
        throw new Error("Failed to update submission");
      }

      const submissionData = updatedSubmission[0];
      let userCreated = false;
      let temporaryPassword = null;

      // If approved, create a user account
      if (status === 'approved') {
        // Check if user already exists
        const existingUser = await tx.select().from(users).where(eq(users.email, submissionData.personalEmail)).limit(1);

        if (existingUser.length === 0) {
          const defaultPassword = "ChangeMe123!";
          const hashedPassword = await bcrypt.hash(defaultPassword, 12);
          const userId = randomUUID();

          // Create user
          await tx.insert(users).values({
            id: userId,
            name: submissionData.fullName,
            email: submissionData.personalEmail,
            passwordHash: hashedPassword,
            role: 'employee',
            createdAt: now,
            updatedAt: now,
          });

          userCreated = true;
          temporaryPassword = defaultPassword;
        }
      }

      // Fetch reviewer details if reviewedBy exists
      let reviewerDetails = null;
      if (submissionData.reviewedBy) {
        const reviewerData = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, submissionData.reviewedBy))
          .limit(1);

        if (reviewerData.length > 0) {
          reviewerDetails = reviewerData[0];
        }
      }

      // Return updated submission with reviewer details
      return NextResponse.json({
        ...submissionData,
        reviewer: reviewerDetails,
        temporaryPassword,
        userCreated,
      }, { status: 200 });
    });

    return transactionResult;

  } catch (error) {
    console.error('PATCH /api/onboarding/[id]/status error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}