import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewCycles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate user role from headers
    const userRole = request.headers.get('user-role');
    
    if (!userRole) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid cycle ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const cycleId = parseInt(id);

    // Check if cycle exists
    const existingCycle = await db.select()
      .from(reviewCycles)
      .where(eq(reviewCycles.id, cycleId))
      .limit(1);

    if (existingCycle.length === 0) {
      return NextResponse.json(
        { 
          error: 'Review cycle not found',
          code: 'CYCLE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const cycle = existingCycle[0];

    // Validate cycle status - must be "active" or "draft"
    if (cycle.status !== 'active' && cycle.status !== 'draft') {
      return NextResponse.json(
        { 
          error: `Cannot lock cycle with status "${cycle.status}". Cycle must be in "active" or "draft" status.`,
          code: 'INVALID_STATUS_TRANSITION',
          currentStatus: cycle.status
        },
        { status: 400 }
      );
    }

    // Update cycle status to "locked"
    const updatedCycle = await db.update(reviewCycles)
      .set({
        status: 'locked',
        updatedAt: new Date().toISOString()
      })
      .where(eq(reviewCycles.id, cycleId))
      .returning();

    if (updatedCycle.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to lock review cycle',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Review cycle locked successfully',
        cycle: updatedCycle[0]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/reviews/cycles/[id]/lock error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}