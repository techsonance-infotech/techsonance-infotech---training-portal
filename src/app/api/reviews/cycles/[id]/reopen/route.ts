import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewCycles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract user role from headers for access control
    const userRole = request.headers.get('user-role');
    
    // Authentication check
    if (!userRole) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid cycle ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const cycleId = parseInt(id);

    // Check if cycle exists
    const existingCycle = await db
      .select()
      .from(reviewCycles)
      .where(eq(reviewCycles.id, cycleId))
      .limit(1);

    if (existingCycle.length === 0) {
      return NextResponse.json(
        { error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const cycle = existingCycle[0];

    // Validate cycle is currently locked
    if (cycle.status !== 'locked') {
      return NextResponse.json(
        {
          error: `Cannot reopen cycle with status "${cycle.status}". Only locked cycles can be reopened.`,
          code: 'INVALID_STATUS_TRANSITION',
          currentStatus: cycle.status,
        },
        { status: 400 }
      );
    }

    // Cannot reopen completed cycles
    if (cycle.status === 'completed') {
      return NextResponse.json(
        {
          error: 'Cannot reopen completed cycles',
          code: 'CANNOT_REOPEN_COMPLETED',
        },
        { status: 400 }
      );
    }

    // Update cycle status to active
    const updatedCycle = await db
      .update(reviewCycles)
      .set({
        status: 'active',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reviewCycles.id, cycleId))
      .returning();

    if (updatedCycle.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update review cycle', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Review cycle reopened successfully',
        cycle: updatedCycle[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/reviews/cycles/[id]/reopen error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}