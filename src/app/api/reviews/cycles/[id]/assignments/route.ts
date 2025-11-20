import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewerAssignments, reviewCycles, user, reviewNotifications, reviewForms } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_REVIEWER_TYPES = ['self', 'peer', 'client', 'manager'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cycleIdParam } = await params;
    
    // Validate authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Admin and HR only
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const cycleId = parseInt(cycleIdParam);
    if (!cycleId || isNaN(cycleId)) {
      return NextResponse.json({ error: 'Valid cycle ID is required', code: 'INVALID_CYCLE_ID' }, { status: 400 });
    }

    // Check if cycle exists
    const cycle = await db.select()
      .from(reviewCycles)
      .where(eq(reviewCycles.id, cycleId))
      .limit(1);

    if (cycle.length === 0) {
      return NextResponse.json({ error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' }, { status: 404 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const reviewerId = searchParams.get('reviewerId');
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [eq(reviewerAssignments.cycleId, cycleId)];
    
    if (employeeId) {
      conditions.push(eq(reviewerAssignments.employeeId, employeeId));
    }
    
    if (reviewerId) {
      conditions.push(eq(reviewerAssignments.reviewerId, reviewerId));
    }
    
    if (status) {
      conditions.push(eq(reviewerAssignments.status, status));
    }

    // Fetch assignments
    const assignments = await db.select()
      .from(reviewerAssignments)
      .where(and(...conditions))
      .orderBy(desc(reviewerAssignments.createdAt));

    // Get unique user IDs for employees and reviewers
    const employeeIds = [...new Set(assignments.map(a => a.employeeId))];
    const reviewerIds = [...new Set(assignments.map(a => a.reviewerId))];
    const allUserIds = [...new Set([...employeeIds, ...reviewerIds])];

    // Fetch user details
    let users: any[] = [];
    if (allUserIds.length > 0) {
      users = await db.select()
        .from(user)
        .where(inArray(user.id, allUserIds));
    }

    // Create user map for quick lookup
    const userMap = new Map(users.map(u => [u.id, { id: u.id, name: u.name, email: u.email, role: u.role }]));

    // Enrich assignments with user details
    const enrichedAssignments = assignments.map(assignment => ({
      ...assignment,
      employee: userMap.get(assignment.employeeId) || null,
      reviewer: userMap.get(assignment.reviewerId) || null,
    }));

    return NextResponse.json(enrichedAssignments, { status: 200 });

  } catch (error: any) {
    console.error('GET assignments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cycleIdParam } = await params;
    
    // Validate authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Admin only
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const cycleId = parseInt(cycleIdParam);
    if (!cycleId || isNaN(cycleId)) {
      return NextResponse.json({ error: 'Valid cycle ID is required', code: 'INVALID_CYCLE_ID' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { assignments } = body;

    // Validate request structure
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ 
        error: 'Assignments array is required and must not be empty', 
        code: 'INVALID_ASSIGNMENTS' 
      }, { status: 400 });
    }

    // Validate cycle exists and is not locked/completed
    const cycle = await db.select()
      .from(reviewCycles)
      .where(eq(reviewCycles.id, cycleId))
      .limit(1);

    if (cycle.length === 0) {
      return NextResponse.json({ error: 'Review cycle not found', code: 'CYCLE_NOT_FOUND' }, { status: 404 });
    }

    if (cycle[0].status === 'locked' || cycle[0].status === 'completed') {
      return NextResponse.json({ 
        error: 'Cannot assign reviewers to a locked or completed cycle', 
        code: 'CYCLE_LOCKED' 
      }, { status: 400 });
    }

    // Validate each assignment
    const validationErrors: string[] = [];
    const userIdsToValidate = new Set<string>();

    assignments.forEach((assignment: any, index: number) => {
      if (!assignment.employeeId || typeof assignment.employeeId !== 'string') {
        validationErrors.push(`Assignment ${index}: employeeId is required and must be a string`);
      }
      if (!assignment.reviewerId || typeof assignment.reviewerId !== 'string') {
        validationErrors.push(`Assignment ${index}: reviewerId is required and must be a string`);
      }
      if (!assignment.reviewerType || !VALID_REVIEWER_TYPES.includes(assignment.reviewerType)) {
        validationErrors.push(`Assignment ${index}: reviewerType must be one of: ${VALID_REVIEWER_TYPES.join(', ')}`);
      }

      if (assignment.employeeId) userIdsToValidate.add(assignment.employeeId);
      if (assignment.reviewerId) userIdsToValidate.add(assignment.reviewerId);
    });

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        code: 'VALIDATION_ERROR',
        details: validationErrors 
      }, { status: 400 });
    }

    // Validate all user IDs exist
    const userIds = Array.from(userIdsToValidate);
    const existingUsers = await db.select({ id: user.id, name: user.name })
      .from(user)
      .where(inArray(user.id, userIds));

    const existingUserIds = new Set(existingUsers.map(u => u.id));
    const missingUserIds = userIds.filter(id => !existingUserIds.has(id));

    if (missingUserIds.length > 0) {
      return NextResponse.json({ 
        error: 'Some user IDs do not exist', 
        code: 'INVALID_USER_IDS',
        details: { missingUserIds } 
      }, { status: 400 });
    }

    // Check for duplicate assignments in the cycle
    const existingAssignments = await db.select()
      .from(reviewerAssignments)
      .where(eq(reviewerAssignments.cycleId, cycleId));

    const existingSet = new Set(
      existingAssignments.map(a => `${a.employeeId}-${a.reviewerId}-${a.reviewerType}`)
    );

    const duplicates: string[] = [];
    assignments.forEach((assignment: any, index: number) => {
      const key = `${assignment.employeeId}-${assignment.reviewerId}-${assignment.reviewerType}`;
      if (existingSet.has(key)) {
        duplicates.push(`Assignment ${index}: duplicate assignment (employeeId: ${assignment.employeeId}, reviewerId: ${assignment.reviewerId}, type: ${assignment.reviewerType})`);
      }
    });

    if (duplicates.length > 0) {
      return NextResponse.json({ 
        error: 'Duplicate assignments detected', 
        code: 'DUPLICATE_ASSIGNMENTS',
        details: duplicates 
      }, { status: 409 });
    }

    // Create user map for notifications
    const userMap = new Map(existingUsers.map(u => [u.id, u.name]));

    // Prepare assignments for batch insert
    const now = new Date().toISOString();
    const assignmentsToCreate = assignments.map((assignment: any) => ({
      cycleId,
      employeeId: assignment.employeeId,
      reviewerId: assignment.reviewerId,
      reviewerType: assignment.reviewerType,
      assignedBy: currentUser.id,
      status: 'pending',
      notifiedAt: null,
      createdAt: now,
    }));

    // Insert assignments
    const createdAssignments = await db.insert(reviewerAssignments)
      .values(assignmentsToCreate)
      .returning();

    // Create review forms for each assignment
    const formsToCreate = createdAssignments.map(assignment => ({
      cycleId,
      employeeId: assignment.employeeId,
      reviewerId: assignment.reviewerId,
      reviewerType: assignment.reviewerType,
      status: 'pending',
      overallRating: null,
      goalsAchievement: null,
      strengths: null,
      improvements: null,
      kpiScores: null,
      additionalComments: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    }));

    const createdForms = await db.insert(reviewForms)
      .values(formsToCreate)
      .returning();

    // Create a map of assignment to form ID
    const formMap = new Map();
    createdAssignments.forEach((assignment, index) => {
      const key = `${assignment.employeeId}-${assignment.reviewerId}-${assignment.reviewerType}`;
      formMap.set(key, createdForms[index].id);
    });

    // Create notifications for each reviewer with form ID
    const notificationsToCreate = createdAssignments.map(assignment => {
      const key = `${assignment.employeeId}-${assignment.reviewerId}-${assignment.reviewerType}`;
      const formId = formMap.get(key);
      
      return {
        userId: assignment.reviewerId,
        notificationType: 'review_requested',
        title: 'New Review Requested',
        message: `You have been assigned to review ${userMap.get(assignment.employeeId) || 'an employee'} for ${cycle[0].name}`,
        relatedId: formId,
        isRead: false,
        createdAt: now,
      };
    });

    await db.insert(reviewNotifications)
      .values(notificationsToCreate);

    // Update notifiedAt for assignments
    const notificationTime = now;
    for (const assignment of createdAssignments) {
      await db.update(reviewerAssignments)
        .set({ notifiedAt: notificationTime })
        .where(eq(reviewerAssignments.id, assignment.id));
    }

    // Fetch updated assignments with notifiedAt
    const finalAssignments = await db.select()
      .from(reviewerAssignments)
      .where(inArray(reviewerAssignments.id, createdAssignments.map(a => a.id)));

    return NextResponse.json({
      assignments: finalAssignments,
      formsCreated: createdForms.length,
      message: `Successfully created ${finalAssignments.length} assignments and ${createdForms.length} review forms`
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST assignments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}