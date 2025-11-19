import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewForms, reviewCycles, user, reviewerAssignments, reviewNotifications } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');
    const employeeId = searchParams.get('employeeId');
    const reviewerId = searchParams.get('reviewerId');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db
      .select({
        form: reviewForms,
        employee: user,
        reviewer: user,
        cycle: reviewCycles,
      })
      .from(reviewForms)
      .leftJoin(user, eq(reviewForms.employeeId, user.id))
      .leftJoin(user, eq(reviewForms.reviewerId, user.id))
      .leftJoin(reviewCycles, eq(reviewForms.cycleId, reviewCycles.id))
      .$dynamic();

    const conditions = [];

    // Role-based filtering
    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      // Admin/HR can see all forms with optional filters
      if (cycleId) {
        conditions.push(eq(reviewForms.cycleId, parseInt(cycleId)));
      }
      if (employeeId) {
        conditions.push(eq(reviewForms.employeeId, employeeId));
      }
      if (reviewerId) {
        conditions.push(eq(reviewForms.reviewerId, reviewerId));
      }
      if (status) {
        conditions.push(eq(reviewForms.status, status));
      }
      if (role) {
        conditions.push(eq(reviewForms.reviewerType, role));
      }
    } else {
      // Employee/Intern: see forms where they are reviewer OR employee
      const userCondition = or(
        eq(reviewForms.reviewerId, currentUser.id),
        eq(reviewForms.employeeId, currentUser.id)
      );
      conditions.push(userCondition);

      // Apply additional filters
      if (cycleId) {
        conditions.push(eq(reviewForms.cycleId, parseInt(cycleId)));
      }
      if (status) {
        conditions.push(eq(reviewForms.status, status));
      }
      if (role) {
        conditions.push(eq(reviewForms.reviewerType, role));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(reviewForms.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform results to include joined data
    const forms = results.map(result => ({
      ...result.form,
      employee: result.employee,
      reviewer: result.reviewer,
      cycle: result.cycle,
    }));

    return NextResponse.json(forms, { status: 200 });
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
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      cycleId,
      employeeId,
      reviewerId,
      reviewerType,
      status,
      overallRating,
      goalsAchievement,
      strengths,
      improvements,
      kpiScores,
      additionalComments,
    } = body;

    // Validate required fields
    if (!cycleId) {
      return NextResponse.json(
        { error: 'cycleId is required', code: 'MISSING_CYCLE_ID' },
        { status: 400 }
      );
    }

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required', code: 'MISSING_EMPLOYEE_ID' },
        { status: 400 }
      );
    }

    if (!reviewerType) {
      return NextResponse.json(
        { error: 'reviewerType is required', code: 'MISSING_REVIEWER_TYPE' },
        { status: 400 }
      );
    }

    // Validate reviewerType
    const validReviewerTypes = ['self', 'peer', 'client', 'manager'];
    if (!validReviewerTypes.includes(reviewerType)) {
      return NextResponse.json(
        { error: 'Invalid reviewerType', code: 'INVALID_REVIEWER_TYPE' },
        { status: 400 }
      );
    }

    // Set reviewerId to current user if not provided
    const finalReviewerId = reviewerId || currentUser.id;

    // Access control: user must be the reviewer or admin/hr
    if (
      finalReviewerId !== currentUser.id &&
      currentUser.role !== 'admin' &&
      currentUser.role !== 'hr'
    ) {
      return NextResponse.json(
        { error: 'Permission denied', code: 'PERMISSION_DENIED' },
        { status: 403 }
      );
    }

    // Validate cycle exists and is active
    const cycle = await db
      .select()
      .from(reviewCycles)
      .where(eq(reviewCycles.id, parseInt(cycleId)))
      .limit(1);

    if (cycle.length === 0) {
      return NextResponse.json(
        { error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (cycle[0].status === 'locked' || cycle[0].status === 'completed') {
      return NextResponse.json(
        { error: 'Review cycle is not active', code: 'CYCLE_NOT_ACTIVE' },
        { status: 400 }
      );
    }

    // Validate employeeId exists
    const employee = await db
      .select()
      .from(user)
      .where(eq(user.id, employeeId))
      .limit(1);

    if (employee.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found', code: 'EMPLOYEE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate reviewerId exists
    const reviewer = await db
      .select()
      .from(user)
      .where(eq(user.id, finalReviewerId))
      .limit(1);

    if (reviewer.length === 0) {
      return NextResponse.json(
        { error: 'Reviewer not found', code: 'REVIEWER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate reviewer has assignment
    const assignment = await db
      .select()
      .from(reviewerAssignments)
      .where(
        and(
          eq(reviewerAssignments.cycleId, parseInt(cycleId)),
          eq(reviewerAssignments.employeeId, employeeId),
          eq(reviewerAssignments.reviewerId, finalReviewerId),
          eq(reviewerAssignments.reviewerType, reviewerType)
        )
      )
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json(
        { error: 'Reviewer assignment not found', code: 'ASSIGNMENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate overallRating if provided
    if (overallRating !== undefined && overallRating !== null) {
      const rating = parseInt(overallRating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'overallRating must be between 1 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
    }

    // Auto-calculate overallRating from kpiScores if provided
    let calculatedRating = overallRating;
    if (kpiScores && !overallRating) {
      const scores = Object.values(kpiScores).filter(
        (score) => typeof score === 'number'
      ) as number[];
      if (scores.length > 0) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        calculatedRating = Math.round(average);
      }
    }

    // Validate required fields for submitted status
    if (status === 'submitted') {
      if (!calculatedRating) {
        return NextResponse.json(
          { error: 'overallRating is required for submitted reviews', code: 'MISSING_RATING' },
          { status: 400 }
        );
      }
      if (!goalsAchievement) {
        return NextResponse.json(
          { error: 'goalsAchievement is required for submitted reviews', code: 'MISSING_GOALS' },
          { status: 400 }
        );
      }
      if (!strengths) {
        return NextResponse.json(
          { error: 'strengths is required for submitted reviews', code: 'MISSING_STRENGTHS' },
          { status: 400 }
        );
      }
      if (!improvements) {
        return NextResponse.json(
          {
            error: 'improvements is required for submitted reviews',
            code: 'MISSING_IMPROVEMENTS',
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const submittedAt = status === 'submitted' ? now : null;

    // Check if form already exists
    const existingForm = await db
      .select()
      .from(reviewForms)
      .where(
        and(
          eq(reviewForms.cycleId, parseInt(cycleId)),
          eq(reviewForms.employeeId, employeeId),
          eq(reviewForms.reviewerId, finalReviewerId),
          eq(reviewForms.reviewerType, reviewerType)
        )
      )
      .limit(1);

    let formResult;

    if (existingForm.length > 0) {
      // Update existing form
      formResult = await db
        .update(reviewForms)
        .set({
          status: status || 'draft',
          overallRating: calculatedRating,
          goalsAchievement,
          strengths,
          improvements,
          kpiScores: kpiScores ? JSON.stringify(kpiScores) : null,
          additionalComments,
          submittedAt,
          updatedAt: now,
        })
        .where(eq(reviewForms.id, existingForm[0].id))
        .returning();
    } else {
      // Create new form
      formResult = await db
        .insert(reviewForms)
        .values({
          cycleId: parseInt(cycleId),
          employeeId,
          reviewerId: finalReviewerId,
          reviewerType,
          status: status || 'draft',
          overallRating: calculatedRating,
          goalsAchievement,
          strengths,
          improvements,
          kpiScores: kpiScores ? JSON.stringify(kpiScores) : null,
          additionalComments,
          submittedAt,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
    }

    // Handle status-specific actions
    if (status === 'submitted') {
      // Update reviewer assignment status
      await db
        .update(reviewerAssignments)
        .set({ status: 'completed' })
        .where(eq(reviewerAssignments.id, assignment[0].id));

      // Create notification for employee
      await db.insert(reviewNotifications).values({
        userId: employeeId,
        notificationType: 'review_submitted',
        title: 'Review Submitted',
        message: `${reviewer[0].name} has submitted a review for you`,
        relatedId: formResult[0].id,
        isRead: false,
        createdAt: now,
      });

      // Create notification for admin/hr if manager review
      if (reviewerType === 'manager') {
        const admins = await db
          .select()
          .from(user)
          .where(or(eq(user.role, 'admin'), eq(user.role, 'hr')));

        for (const admin of admins) {
          await db.insert(reviewNotifications).values({
            userId: admin.id,
            notificationType: 'review_submitted',
            title: 'Manager Review Submitted',
            message: `Manager review for ${employee[0].name} has been submitted`,
            relatedId: formResult[0].id,
            isRead: false,
            createdAt: now,
          });
        }
      }
    } else if (status === 'draft') {
      // Create notification for reviewer about draft saved
      await db.insert(reviewNotifications).values({
        userId: finalReviewerId,
        notificationType: 'draft_saved',
        title: 'Review Draft Saved',
        message: `Your review draft for ${employee[0].name} has been saved`,
        relatedId: formResult[0].id,
        isRead: false,
        createdAt: now,
      });
    }

    return NextResponse.json(formResult[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}