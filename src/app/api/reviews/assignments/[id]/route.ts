import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewerAssignments, reviewForms } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    // Extract user role from headers
    const userRole = request.headers.get('user-role');
    
    if (!userRole) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Check if user is admin
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Permission denied. Admin access required.',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Get assignment ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid assignment ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const assignmentId = parseInt(id);

    // Check if assignment exists
    const assignment = await db.select()
      .from(reviewerAssignments)
      .where(eq(reviewerAssignments.id, assignmentId))
      .limit(1);

    if (assignment.length === 0) {
      return NextResponse.json({ 
        error: 'Assignment not found',
        code: 'ASSIGNMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const assignmentData = assignment[0];

    // Check if there is a completed review form for this assignment
    const completedReview = await db.select()
      .from(reviewForms)
      .where(
        and(
          eq(reviewForms.cycleId, assignmentData.cycleId),
          eq(reviewForms.employeeId, assignmentData.employeeId),
          eq(reviewForms.reviewerId, assignmentData.reviewerId),
          eq(reviewForms.status, 'submitted')
        )
      )
      .limit(1);

    if (completedReview.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete assignment with completed review form',
        code: 'COMPLETED_REVIEW_EXISTS' 
      }, { status: 409 });
    }

    // Delete the assignment
    const deleted = await db.delete(reviewerAssignments)
      .where(eq(reviewerAssignments.id, assignmentId))
      .returning();

    return NextResponse.json({
      message: 'Assignment deleted successfully',
      assignment: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE assignment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}