import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewCycles, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser();
    if (!authenticatedUser) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    // Check role - only admin and hr can access
    if (authenticatedUser.role !== 'admin' && authenticatedUser.role !== 'hr') {
      return NextResponse.json({
        error: 'Access denied. Admin or HR role required.',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const cycleTypeFilter = searchParams.get('cycleType');

    // Build query with filters
    let query = db
      .select({
        id: reviewCycles.id,
        name: reviewCycles.name,
        cycleType: reviewCycles.cycleType,
        startDate: reviewCycles.startDate,
        endDate: reviewCycles.endDate,
        status: reviewCycles.status,
        createdBy: reviewCycles.createdBy,
        createdAt: reviewCycles.createdAt,
        updatedAt: reviewCycles.updatedAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        }
      })
      .from(reviewCycles)
      .leftJoin(users, eq(reviewCycles.createdBy, users.id))
      .orderBy(desc(reviewCycles.createdAt));

    // Apply filters
    const conditions = [];
    if (statusFilter) {
      conditions.push(eq(reviewCycles.status, statusFilter));
    }
    if (cycleTypeFilter) {
      conditions.push(eq(reviewCycles.cycleType, cycleTypeFilter));
    }

    let results;
    if (conditions.length > 0) {
      results = await query.where(and(...conditions));
    } else {
      results = await query;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as any).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser();
    if (!authenticatedUser) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }, { status: 401 });
    }

    // Check role - only admin can create cycles
    if (authenticatedUser.role !== 'admin') {
      return NextResponse.json({
        error: 'Access denied. Admin role required.',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 });
    }

    const body = await request.json();

    // Security check: reject if createdBy provided in body
    if ('createdBy' in body || 'created_by' in body) {
      return NextResponse.json({
        error: "Creator ID cannot be provided in request body",
        code: "CREATOR_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    const { name, cycleType, startDate, endDate, status } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        error: "Name is required",
        code: "MISSING_NAME"
      }, { status: 400 });
    }

    if (!cycleType) {
      return NextResponse.json({
        error: "Cycle type is required",
        code: "MISSING_CYCLE_TYPE"
      }, { status: 400 });
    }

    if (!startDate) {
      return NextResponse.json({
        error: "Start date is required",
        code: "MISSING_START_DATE"
      }, { status: 400 });
    }

    if (!endDate) {
      return NextResponse.json({
        error: "End date is required",
        code: "MISSING_END_DATE"
      }, { status: 400 });
    }

    // Validate cycleType
    if (cycleType !== '6-month' && cycleType !== '1-year') {
      return NextResponse.json({
        error: "Cycle type must be '6-month' or '1-year'",
        code: "INVALID_CYCLE_TYPE"
      }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['draft', 'active', 'locked', 'completed'];
    const cycleStatus = status || 'draft';
    if (!validStatuses.includes(cycleStatus)) {
      return NextResponse.json({
        error: "Status must be one of: draft, active, locked, completed",
        code: "INVALID_STATUS"
      }, { status: 400 });
    }

    // Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return NextResponse.json({
        error: "Invalid start date format",
        code: "INVALID_START_DATE"
      }, { status: 400 });
    }

    if (isNaN(end.getTime())) {
      return NextResponse.json({
        error: "Invalid end date format",
        code: "INVALID_END_DATE"
      }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({
        error: "Start date must be before end date",
        code: "INVALID_DATE_RANGE"
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Create the review cycle
    const newCycle = await db.insert(reviewCycles)
      .values({
        name: name.trim(),
        cycleType,
        startDate,
        endDate,
        status: cycleStatus,
        createdBy: authenticatedUser.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newCycle[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}