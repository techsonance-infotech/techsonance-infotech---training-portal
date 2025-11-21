import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appraisals, user, reviewCycles } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRole = currentUser.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'hr') {
      return NextResponse.json(
        { error: 'Access denied. Admin or HR role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const cycleId = searchParams.get('cycleId');
    const reviewYear = searchParams.get('reviewYear');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db
      .select({
        id: appraisals.id,
        employeeId: appraisals.employeeId,
        cycleId: appraisals.cycleId,
        reviewYear: appraisals.reviewYear,
        pastCtc: appraisals.pastCtc,
        currentCtc: appraisals.currentCtc,
        hikePercentage: appraisals.hikePercentage,
        notes: appraisals.notes,
        updatedBy: appraisals.updatedBy,
        createdAt: appraisals.createdAt,
        updatedAt: appraisals.updatedAt,
        employee: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        cycle: {
          id: reviewCycles.id,
          name: reviewCycles.name,
          status: reviewCycles.status,
          startDate: reviewCycles.startDate,
          endDate: reviewCycles.endDate,
        },
      })
      .from(appraisals)
      .leftJoin(user, eq(appraisals.employeeId, user.id))
      .leftJoin(reviewCycles, eq(appraisals.cycleId, reviewCycles.id));

    const conditions = [];
    if (employeeId) {
      conditions.push(eq(appraisals.employeeId, employeeId));
    }
    if (cycleId) {
      const parsedCycleId = parseInt(cycleId);
      if (isNaN(parsedCycleId)) {
        return NextResponse.json(
          { error: 'Invalid cycleId parameter', code: 'INVALID_CYCLE_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(appraisals.cycleId, parsedCycleId));
    }
    if (reviewYear) {
      const parsedYear = parseInt(reviewYear);
      if (isNaN(parsedYear)) {
        return NextResponse.json(
          { error: 'Invalid reviewYear parameter', code: 'INVALID_REVIEW_YEAR' },
          { status: 400 }
        );
      }
      conditions.push(eq(appraisals.reviewYear, parsedYear));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(appraisals.createdAt))
      .limit(limit)
      .offset(offset);

    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        const updatedByUser = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
          .from(user)
          .where(eq(user.id, result.updatedBy))
          .limit(1);

        return {
          ...result,
          updatedByUser: updatedByUser[0] || null,
        };
      })
    );

    return NextResponse.json(enrichedResults, { status: 200 });
  } catch (error) {
    console.error('GET appraisals error:', error);
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
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRole = currentUser.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'hr') {
      return NextResponse.json(
        { error: 'Access denied. Admin or HR role required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if ('updatedBy' in body) {
      return NextResponse.json(
        {
          error: 'updatedBy cannot be provided in request body',
          code: 'UPDATED_BY_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { employeeId, cycleId, reviewYear, pastCtc, currentCtc, notes, hikePercentage } = body;

    if (!employeeId || typeof employeeId !== 'string') {
      return NextResponse.json(
        { error: 'employeeId is required and must be a string', code: 'MISSING_EMPLOYEE_ID' },
        { status: 400 }
      );
    }

    if (!cycleId || typeof cycleId !== 'number') {
      return NextResponse.json(
        { error: 'cycleId is required and must be a number', code: 'MISSING_CYCLE_ID' },
        { status: 400 }
      );
    }

    if (!reviewYear || typeof reviewYear !== 'number') {
      return NextResponse.json(
        { error: 'reviewYear is required and must be a number', code: 'MISSING_REVIEW_YEAR' },
        { status: 400 }
      );
    }

    if (reviewYear < 2020 || reviewYear > 2030 || reviewYear.toString().length !== 4) {
      return NextResponse.json(
        {
          error: 'reviewYear must be a 4-digit year between 2020 and 2030',
          code: 'INVALID_REVIEW_YEAR',
        },
        { status: 400 }
      );
    }

    if (!pastCtc || typeof pastCtc !== 'number' || pastCtc <= 0) {
      return NextResponse.json(
        { error: 'pastCtc is required and must be a positive number', code: 'INVALID_PAST_CTC' },
        { status: 400 }
      );
    }

    if (!currentCtc || typeof currentCtc !== 'number' || currentCtc <= 0) {
      return NextResponse.json(
        {
          error: 'currentCtc is required and must be a positive number',
          code: 'INVALID_CURRENT_CTC',
        },
        { status: 400 }
      );
    }

    if (hikePercentage !== undefined && typeof hikePercentage !== 'number') {
      return NextResponse.json(
        { error: 'hikePercentage must be a number', code: 'INVALID_HIKE_PERCENTAGE' },
        { status: 400 }
      );
    }

    const employeeExists = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, employeeId))
      .limit(1);

    if (employeeExists.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found', code: 'EMPLOYEE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const cycleExists = await db
      .select({ id: reviewCycles.id })
      .from(reviewCycles)
      .where(eq(reviewCycles.id, cycleId))
      .limit(1);

    if (cycleExists.length === 0) {
      return NextResponse.json(
        { error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const duplicateCheck = await db
      .select({ id: appraisals.id })
      .from(appraisals)
      .where(and(eq(appraisals.employeeId, employeeId), eq(appraisals.cycleId, cycleId)))
      .limit(1);

    if (duplicateCheck.length > 0) {
      return NextResponse.json(
        {
          error: 'Appraisal already exists for this employee and cycle',
          code: 'DUPLICATE_APPRAISAL',
        },
        { status: 409 }
      );
    }

    const calculatedHikePercentage =
      hikePercentage !== undefined
        ? hikePercentage
        : ((currentCtc - pastCtc) / pastCtc) * 100;

    const now = new Date().toISOString();

    const newAppraisal = await db
      .insert(appraisals)
      .values({
        employeeId,
        cycleId,
        reviewYear,
        pastCtc,
        currentCtc,
        hikePercentage: calculatedHikePercentage,
        notes: notes || null,
        updatedBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const enrichedAppraisal = await db
      .select({
        id: appraisals.id,
        employeeId: appraisals.employeeId,
        cycleId: appraisals.cycleId,
        reviewYear: appraisals.reviewYear,
        pastCtc: appraisals.pastCtc,
        currentCtc: appraisals.currentCtc,
        hikePercentage: appraisals.hikePercentage,
        notes: appraisals.notes,
        updatedBy: appraisals.updatedBy,
        createdAt: appraisals.createdAt,
        updatedAt: appraisals.updatedAt,
        employee: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        cycle: {
          id: reviewCycles.id,
          name: reviewCycles.name,
          status: reviewCycles.status,
          startDate: reviewCycles.startDate,
          endDate: reviewCycles.endDate,
        },
      })
      .from(appraisals)
      .leftJoin(user, eq(appraisals.employeeId, user.id))
      .leftJoin(reviewCycles, eq(appraisals.cycleId, reviewCycles.id))
      .where(eq(appraisals.id, newAppraisal[0].id))
      .limit(1);

    const updatedByUser = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    const result = {
      ...enrichedAppraisal[0],
      updatedByUser: updatedByUser[0] || null,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST appraisals error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}