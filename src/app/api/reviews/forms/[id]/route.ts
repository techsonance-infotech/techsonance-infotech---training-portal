import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewForms, reviewCycles, user, reviewerAssignments, reviewNotifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const formId = params.id;
    if (!formId || isNaN(parseInt(formId))) {
      return NextResponse.json({ 
        error: 'Valid form ID is required',
        code: 'INVALID_FORM_ID' 
      }, { status: 400 });
    }

    // Get form with related data
    const form = await db.select({
      id: reviewForms.id,
      cycleId: reviewForms.cycleId,
      employeeId: reviewForms.employeeId,
      reviewerId: reviewForms.reviewerId,
      reviewerType: reviewForms.reviewerType,
      status: reviewForms.status,
      overallRating: reviewForms.overallRating,
      goalsAchievement: reviewForms.goalsAchievement,
      strengths: reviewForms.strengths,
      improvements: reviewForms.improvements,
      kpiScores: reviewForms.kpiScores,
      additionalComments: reviewForms.additionalComments,
      submittedAt: reviewForms.submittedAt,
      createdAt: reviewForms.createdAt,
      updatedAt: reviewForms.updatedAt,
      cycleName: reviewCycles.name,
      cycleStatus: reviewCycles.status,
      cycleStartDate: reviewCycles.startDate,
      cycleEndDate: reviewCycles.endDate,
      employeeName: user.name,
      employeeEmail: user.email,
    })
    .from(reviewForms)
    .leftJoin(reviewCycles, eq(reviewForms.cycleId, reviewCycles.id))
    .leftJoin(user, eq(reviewForms.employeeId, user.id))
    .where(eq(reviewForms.id, parseInt(formId)))
    .limit(1);

    if (form.length === 0) {
      return NextResponse.json({ 
        error: 'Review form not found',
        code: 'FORM_NOT_FOUND' 
      }, { status: 404 });
    }

    const formData = form[0];

    // Get reviewer details
    const reviewer = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, formData.reviewerId))
    .limit(1);

    // Access control
    const userRole = currentUser.role?.toLowerCase();
    const isAdminOrHR = userRole === 'admin' || userRole === 'hr';
    const isReviewer = currentUser.id === formData.reviewerId;
    const isEmployee = currentUser.id === formData.employeeId;

    if (!isAdminOrHR && !isReviewer && !isEmployee) {
      return NextResponse.json({ 
        error: 'You do not have permission to access this review form',
        code: 'PERMISSION_DENIED' 
      }, { status: 403 });
    }

    // Build response with full details
    const response = {
      ...formData,
      cycle: {
        id: formData.cycleId,
        name: formData.cycleName,
        status: formData.cycleStatus,
        startDate: formData.cycleStartDate,
        endDate: formData.cycleEndDate,
      },
      employee: {
        id: formData.employeeId,
        name: formData.employeeName,
        email: formData.employeeEmail,
      },
      reviewer: reviewer.length > 0 ? {
        id: reviewer[0].id,
        name: reviewer[0].name,
        email: reviewer[0].email,
        role: reviewer[0].role,
      } : null,
    };

    // Remove redundant fields
    delete response.cycleName;
    delete response.cycleStatus;
    delete response.cycleStartDate;
    delete response.cycleEndDate;
    delete response.employeeName;
    delete response.employeeEmail;

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET review form error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const formId = params.id;
    if (!formId || isNaN(parseInt(formId))) {
      return NextResponse.json({ 
        error: 'Valid form ID is required',
        code: 'INVALID_FORM_ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { 
      status, 
      overallRating, 
      goalsAchievement, 
      strengths, 
      improvements, 
      kpiScores, 
      additionalComments 
    } = body;

    // Validate form exists
    const existingForm = await db.select({
      id: reviewForms.id,
      cycleId: reviewForms.cycleId,
      employeeId: reviewForms.employeeId,
      reviewerId: reviewForms.reviewerId,
      status: reviewForms.status,
      cycleStatus: reviewCycles.status,
    })
    .from(reviewForms)
    .leftJoin(reviewCycles, eq(reviewForms.cycleId, reviewCycles.id))
    .where(eq(reviewForms.id, parseInt(formId)))
    .limit(1);

    if (existingForm.length === 0) {
      return NextResponse.json({ 
        error: 'Review form not found',
        code: 'FORM_NOT_FOUND' 
      }, { status: 404 });
    }

    const formData = existingForm[0];

    // Access control - must be reviewer or admin/hr
    const userRole = currentUser.role?.toLowerCase();
    const isAdminOrHR = userRole === 'admin' || userRole === 'hr';
    const isReviewer = currentUser.id === formData.reviewerId;

    if (!isAdminOrHR && !isReviewer) {
      return NextResponse.json({ 
        error: 'You do not have permission to update this review form',
        code: 'PERMISSION_DENIED' 
      }, { status: 403 });
    }

    // Check if cycle is locked
    if (formData.cycleStatus === 'locked' || formData.cycleStatus === 'completed') {
      return NextResponse.json({ 
        error: 'Cannot update review form for a locked or completed cycle',
        code: 'CYCLE_LOCKED' 
      }, { status: 400 });
    }

    // Validate overallRating if provided
    if (overallRating !== undefined && overallRating !== null) {
      if (!Number.isInteger(overallRating) || overallRating < 1 || overallRating > 5) {
        return NextResponse.json({ 
          error: 'Overall rating must be an integer between 1 and 5',
          code: 'INVALID_RATING' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) updateData.status = status;
    if (goalsAchievement !== undefined) updateData.goalsAchievement = goalsAchievement;
    if (strengths !== undefined) updateData.strengths = strengths;
    if (improvements !== undefined) updateData.improvements = improvements;
    if (kpiScores !== undefined) updateData.kpiScores = kpiScores;
    if (additionalComments !== undefined) updateData.additionalComments = additionalComments;

    // Auto-calculate overallRating from kpiScores if provided and overallRating is not
    if (kpiScores && overallRating === undefined) {
      try {
        const scores = typeof kpiScores === 'string' ? JSON.parse(kpiScores) : kpiScores;
        if (Array.isArray(scores) && scores.length > 0) {
          const validScores = scores.filter(s => typeof s.score === 'number' && s.score >= 1 && s.score <= 5);
          if (validScores.length > 0) {
            const avgScore = validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length;
            updateData.overallRating = Math.round(avgScore);
          }
        }
      } catch (e) {
        // If parsing fails, skip auto-calculation
      }
    } else if (overallRating !== undefined) {
      updateData.overallRating = overallRating;
    }

    // Check if status is being changed to submitted
    const isSubmitting = status === 'submitted' && 
                        (formData.status === 'pending' || formData.status === 'draft');

    if (isSubmitting) {
      // Validate required fields
      const currentData = existingForm[0];
      const finalData = { ...currentData, ...updateData };

      if (!finalData.overallRating || 
          !finalData.goalsAchievement || 
          !finalData.strengths || 
          !finalData.improvements) {
        return NextResponse.json({ 
          error: 'All required fields must be completed before submitting (overallRating, goalsAchievement, strengths, improvements)',
          code: 'INCOMPLETE_FORM' 
        }, { status: 400 });
      }

      // Set submittedAt timestamp
      updateData.submittedAt = new Date().toISOString();

      // Update reviewer assignment status to completed
      await db.update(reviewerAssignments)
        .set({
          status: 'completed',
        })
        .where(
          and(
            eq(reviewerAssignments.cycleId, formData.cycleId),
            eq(reviewerAssignments.employeeId, formData.employeeId),
            eq(reviewerAssignments.reviewerId, formData.reviewerId)
          )
        );

      // Create notification for employee
      await db.insert(reviewNotifications).values({
        userId: formData.employeeId,
        notificationType: 'review_submitted',
        title: 'Review Submitted',
        message: `A review has been submitted for you by your reviewer`,
        relatedId: parseInt(formId),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Update the form
    const updated = await db.update(reviewForms)
      .set(updateData)
      .where(eq(reviewForms.id, parseInt(formId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update review form',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT review form error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    // Admin only check
    const userRole = currentUser.role?.toLowerCase();
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        error: 'Only administrators can delete review forms',
        code: 'ADMIN_ONLY' 
      }, { status: 403 });
    }

    const formId = params.id;
    if (!formId || isNaN(parseInt(formId))) {
      return NextResponse.json({ 
        error: 'Valid form ID is required',
        code: 'INVALID_FORM_ID' 
      }, { status: 400 });
    }

    // Check if form exists
    const existingForm = await db.select()
      .from(reviewForms)
      .where(eq(reviewForms.id, parseInt(formId)))
      .limit(1);

    if (existingForm.length === 0) {
      return NextResponse.json({ 
        error: 'Review form not found',
        code: 'FORM_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the form
    const deleted = await db.delete(reviewForms)
      .where(eq(reviewForms.id, parseInt(formId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete review form',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Review form deleted successfully',
      deletedForm: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE review form error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}