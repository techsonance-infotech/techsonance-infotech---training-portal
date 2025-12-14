import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewCycles, reviewForms, users } from '@/db/schema';
import { eq, and, count, avg, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

// GET /api/reviews/cycles/[id] - Get single cycle with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check permissions - Admin and HR only
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const cycleId = id;

    // Validate ID
    if (!cycleId || isNaN(parseInt(cycleId))) {
      return NextResponse.json(
        { error: 'Valid cycle ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Get cycle details
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

    // Get all forms with employee and reviewer details
    const forms = await db
      .select({
        id: reviewForms.id,
        employeeId: reviewForms.employeeId,
        employeeName: sql<string>`employee.name`,
        employeeEmail: sql<string>`employee.email`,
        reviewerId: reviewForms.reviewerId,
        reviewerName: sql<string>`reviewer.name`,
        reviewerEmail: sql<string>`reviewer.email`,
        reviewerType: reviewForms.reviewerType,
        status: reviewForms.status,
        overallRating: reviewForms.overallRating,
        submittedAt: reviewForms.submittedAt,
        createdAt: reviewForms.createdAt,
        updatedAt: reviewForms.updatedAt,
      })
      .from(reviewForms)
      .leftJoin(
        sql`${users} as employee`,
        eq(reviewForms.employeeId, sql`employee.id`)
      )
      .leftJoin(
        sql`${users} as reviewer`,
        eq(reviewForms.reviewerId, sql`reviewer.id`)
      )
      .where(eq(reviewForms.cycleId, parseInt(cycleId)));

    // Calculate summary statistics
    const totalForms = forms.length;
    const submittedForms = forms.filter((f) => f.status === 'submitted' || f.status === 'approved').length;
    const pendingForms = forms.filter((f) => f.status === 'pending' || f.status === 'draft').length;

    // Calculate average rating from submitted forms with ratings
    const formsWithRatings = forms.filter(
      (f) => (f.status === 'submitted' || f.status === 'approved') && f.overallRating !== null
    );
    const averageRating =
      formsWithRatings.length > 0
        ? formsWithRatings.reduce((sum, f) => sum + (f.overallRating || 0), 0) / formsWithRatings.length
        : null;

    const response = {
      ...cycle[0],
      forms,
      summary: {
        totalForms,
        submittedForms,
        pendingForms,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(2)) : null,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET cycle error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/cycles/[id] - Update cycle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check permissions - Admin only
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }



    const { id } = await params;
    const cycleId = id;

    // Validate ID
    if (!cycleId || isNaN(parseInt(cycleId))) {
      return NextResponse.json(
        { error: 'Valid cycle ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if cycle exists
    const existingCycle = await db
      .select()
      .from(reviewCycles)
      .where(eq(reviewCycles.id, parseInt(cycleId)))
      .limit(1);

    if (existingCycle.length === 0) {
      return NextResponse.json(
        { error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, cycleType, startDate, endDate, status } = body;

    // Validate cycleType if provided
    if (cycleType && !['6-month', '1-year'].includes(cycleType)) {
      return NextResponse.json(
        { error: 'Invalid cycle type. Must be "6-month" or "1-year"', code: 'INVALID_CYCLE_TYPE' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['draft', 'active', 'locked', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "draft", "active", "locked", or "completed"', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    // Check if trying to unlock a locked cycle
    if (existingCycle[0].status === 'locked' && status === 'active') {
      return NextResponse.json(
        { error: 'Cannot change status from "locked" to "active" without explicit unlock', code: 'LOCKED_CYCLE' },
        { status: 400 }
      );
    }

    // Validate date range if both dates provided
    const newStartDate = startDate || existingCycle[0].startDate;
    const newEndDate = endDate || existingCycle[0].endDate;

    if (new Date(newStartDate) >= new Date(newEndDate)) {
      return NextResponse.json(
        { error: 'Start date must be before end date', code: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (cycleType !== undefined) updateData.cycleType = cycleType;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (status !== undefined) updateData.status = status;

    // Update cycle
    const updated = await db
      .update(reviewCycles)
      .set(updateData)
      .where(eq(reviewCycles.id, parseInt(cycleId)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT cycle error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/cycles/[id] - Delete cycle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check permissions - Admin only
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

  }

    const { id } = await params;
  const cycleId = id;

  // Validate ID
  if (!cycleId || isNaN(parseInt(cycleId))) {
    return NextResponse.json(
      { error: 'Valid cycle ID is required', code: 'INVALID_ID' },
      { status: 400 }
    );
  }

  // Check if cycle exists
  const existingCycle = await db
    .select()
    .from(reviewCycles)
    .where(eq(reviewCycles.id, parseInt(cycleId)))
    .limit(1);

  if (existingCycle.length === 0) {
    return NextResponse.json(
      { error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' },
      { status: 404 }
    );
  }

  // Check if cycle has submitted forms
  const submittedForms = await db
    .select({ count: count() })
    .from(reviewForms)
    .where(
      and(
        eq(reviewForms.cycleId, parseInt(cycleId)),
        eq(reviewForms.status, 'submitted')
      )
    );

  if (submittedForms[0].count > 0) {
    return NextResponse.json(
      {
        error: 'Cannot delete cycle with submitted forms',
        code: 'HAS_SUBMITTED_FORMS',
        submittedFormsCount: submittedForms[0].count,
      },
      { status: 409 }
    );
  }

  // Delete all related forms first
  await db
    .delete(reviewForms)
    .where(eq(reviewForms.cycleId, parseInt(cycleId)));

  // Delete the cycle
  const deleted = await db
    .delete(reviewCycles)
    .where(eq(reviewCycles.id, parseInt(cycleId)))
    .returning();

  return NextResponse.json(
    {
      message: 'Review cycle deleted successfully',
      cycle: deleted[0],
    },
    { status: 200 }
  );
} catch (error) {
  console.error('DELETE cycle error:', error);
  return NextResponse.json(
    { error: 'Internal server error: ' + (error as Error).message },
    { status: 500 }
  );
}
}