import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appraisals, users, reviewCycles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const appraisalId = parseInt(id);

    const appraisalsFound = await db
      .select({
        appraisals: appraisals,
        users: users,
        review_cycles: reviewCycles,
      })
      .from(appraisals)
      .leftJoin(users, eq(appraisals.employeeId, users.id))
      .leftJoin(reviewCycles, eq(appraisals.cycleId, reviewCycles.id))
      .where(eq(appraisals.id, appraisalId));

    if (appraisalsFound.length === 0) {
      return NextResponse.json(
        { error: 'Appraisal not found' },
        { status: 404 }
      );
    }

    // Authorization check
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      const appraisal = appraisalsFound[0].appraisals;
      if (appraisal.employeeId !== currentUser.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { appraisals: appraisal, users: employee, review_cycles: cycle } = appraisalsFound[0];

    return NextResponse.json({
      ...appraisal,
      employee: employee ? {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        image: employee.image,
        role: employee.role,
      } : null,
      cycle: cycle ? {
        id: cycle.id,
        name: cycle.name,
        year: cycle.year,
      } : null,
    });
  } catch (error) {
    console.error('GET appraisal error:', error);
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRole = currentUser.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'hr') {
      return NextResponse.json(
        { error: 'Access forbidden. Admin or HR role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const appraisalId = parseInt(id);

    const existingAppraisal = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId))
      .limit(1);

    if (existingAppraisal.length === 0) {
      return NextResponse.json(
        { error: 'Appraisal not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    if ('employeeId' in body || 'employee_id' in body) {
      return NextResponse.json(
        { error: 'Employee ID cannot be changed', code: 'EMPLOYEE_ID_IMMUTABLE' },
        { status: 400 }
      );
    }

    if ('updatedBy' in body || 'updated_by' in body) {
      return NextResponse.json(
        { error: 'Updated by cannot be provided in request body', code: 'UPDATED_BY_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const { cycleId, reviewYear, pastCtc, currentCtc, hikePercentage, notes } = body;

    if (reviewYear !== undefined && (!Number.isInteger(reviewYear) || reviewYear < 2000 || reviewYear > 2100)) {
      return NextResponse.json(
        { error: 'Review year must be a valid year between 2000 and 2100', code: 'INVALID_REVIEW_YEAR' },
        { status: 400 }
      );
    }

    if (pastCtc !== undefined && (!Number.isInteger(pastCtc) || pastCtc < 0)) {
      return NextResponse.json(
        { error: 'Past CTC must be a non-negative integer', code: 'INVALID_PAST_CTC' },
        { status: 400 }
      );
    }

    if (currentCtc !== undefined && (!Number.isInteger(currentCtc) || currentCtc < 0)) {
      return NextResponse.json(
        { error: 'Current CTC must be a non-negative integer', code: 'INVALID_CURRENT_CTC' },
        { status: 400 }
      );
    }

    if (hikePercentage !== undefined && (typeof hikePercentage !== 'number' || hikePercentage < -100)) {
      return NextResponse.json(
        { error: 'Hike percentage must be a number greater than or equal to -100', code: 'INVALID_HIKE_PERCENTAGE' },
        { status: 400 }
      );
    }

    if (cycleId !== undefined) {
      const cycle = await db
        .select()
        .from(reviewCycles)
        .where(eq(reviewCycles.id, cycleId))
        .limit(1);

      if (cycle.length === 0) {
        return NextResponse.json(
          { error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' },
          { status: 400 }
        );
      }

      const duplicate = await db
        .select()
        .from(appraisals)
        .where(
          and(
            eq(appraisals.employeeId, existingAppraisal[0].employeeId),
            eq(appraisals.cycleId, cycleId),
            eq(appraisals.id, appraisalId)
          )
        )
        .limit(2);

      if (duplicate.length > 1) {
        return NextResponse.json(
          { error: 'An appraisal already exists for this employee and cycle', code: 'DUPLICATE_APPRAISAL' },
          { status: 409 }
        );
      }
    }

    const finalPastCtc = pastCtc !== undefined ? pastCtc : existingAppraisal[0].pastCtc;
    const finalCurrentCtc = currentCtc !== undefined ? currentCtc : existingAppraisal[0].currentCtc;

    let finalHikePercentage = hikePercentage;
    if (finalHikePercentage === undefined && (pastCtc !== undefined || currentCtc !== undefined)) {
      if (finalPastCtc > 0) {
        finalHikePercentage = ((finalCurrentCtc - finalPastCtc) / finalPastCtc) * 100;
      } else {
        finalHikePercentage = 0;
      }
    } else if (finalHikePercentage === undefined) {
      finalHikePercentage = existingAppraisal[0].hikePercentage;
    }

    const updateData: {
      cycleId?: number;
      reviewYear?: number;
      pastCtc?: number;
      currentCtc?: number;
      hikePercentage?: number;
      notes?: string | null;
      updatedBy: string;
      updatedAt: string;
    } = {
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    };

    if (cycleId !== undefined) updateData.cycleId = cycleId;
    if (reviewYear !== undefined) updateData.reviewYear = reviewYear;
    if (pastCtc !== undefined) updateData.pastCtc = pastCtc;
    if (currentCtc !== undefined) updateData.currentCtc = currentCtc;
    if (finalHikePercentage !== undefined) updateData.hikePercentage = finalHikePercentage;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await db
      .update(appraisals)
      .set(updateData)
      .where(eq(appraisals.id, appraisalId))
      .returning();

    const enrichedResult = await db
      .select({
        appraisals: appraisals,
        users: users,
        review_cycles: reviewCycles,
      })
      .from(appraisals)
      .leftJoin(users, eq(appraisals.employeeId, users.id))
      .leftJoin(reviewCycles, eq(appraisals.cycleId, reviewCycles.id))
      .where(eq(appraisals.id, appraisalId));

    if (enrichedResult.length === 0) {
      return NextResponse.json(
        { error: 'Appraisal not found after update' },
        { status: 404 }
      );
    }

    const { appraisals: appraisal, users: employee, review_cycles: cycle } = enrichedResult[0];

    const updatedByUser = await db.query.users.findFirst({
      where: eq(users.id, appraisal.updatedBy || '')
    });

    // safe user
    const safeUpdatedBy = updatedByUser ? {
      id: updatedByUser.id,
      name: updatedByUser.name,
      email: updatedByUser.email,
      role: updatedByUser.role
    } : null;

    return NextResponse.json({
      ...appraisal,
      employee: employee ? {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        image: employee.image,
        role: employee.role,
      } : null,
      cycle: cycle ? {
        id: cycle.id,
        name: cycle.name,
        year: cycle.year,
      } : null,
      updatedByUser: safeUpdatedBy,
    });
  } catch (error) {
    console.error('PUT appraisal error:', error);
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRole = currentUser.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'hr') {
      return NextResponse.json(
        { error: 'Access forbidden. Admin or HR role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const appraisalId = parseInt(id);

    const existingAppraisal = await db
      .select()
      .from(appraisals)
      .where(eq(appraisals.id, appraisalId))
      .limit(1);

    if (existingAppraisal.length === 0) {
      return NextResponse.json(
        { error: 'Appraisal not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(appraisals)
      .where(eq(appraisals.id, appraisalId))
      .returning();

    return NextResponse.json({
      message: 'Appraisal deleted successfully',
      appraisal: deleted[0],
    });
  } catch (error) {
    console.error('DELETE appraisal error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}