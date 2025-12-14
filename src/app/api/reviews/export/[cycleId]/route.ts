import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewCycles, reviewForms, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  try {
    // Authentication check
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Authorization check - admin and hr only
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      return NextResponse.json(
        { error: 'Access denied. Admin or HR role required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate cycle ID
    const { cycleId } = await params;
    if (!cycleId || isNaN(parseInt(cycleId))) {
      return NextResponse.json(
        { error: 'Valid cycle ID is required', code: 'INVALID_CYCLE_ID' },
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

    const cycleData = cycle[0];

    // Get all submitted forms for this cycle with employee and reviewer details
    const forms = await db
      .select({
        formId: reviewForms.id,
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
      })
      .from(reviewForms)
      .where(
        and(
          eq(reviewForms.cycleId, parseInt(cycleId)),
          eq(reviewForms.status, 'submitted')
        )
      );

    // Get all unique employee IDs
    const uniqueEmployeeIds = [...new Set(forms.map(f => f.employeeId))];

    // Get all unique reviewer IDs
    const allUserIds = [
      ...new Set([
        ...forms.map(f => f.employeeId),
        ...forms.map(f => f.reviewerId)
      ])
    ].filter(id => id !== null);

    // Fetch user details for all involved users
    // Fetch user details for all involved users
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(sql`${users.id} IN ${sql.raw(`(${allUserIds.map(id => `'${id}'`).join(',')})`)}`);

    // Create user lookup map
    const userMap = new Map(userDetails.map(u => [u.id, u]));

    // Calculate statistics
    const totalEmployees = uniqueEmployeeIds.length;
    const totalReviews = forms.length;
    const submittedReviews = forms.length; // Already filtered to submitted only

    // Calculate average rating and distribution
    const ratingsData = forms
      .filter(f => f.overallRating !== null)
      .map(f => f.overallRating!);

    const averageRating = ratingsData.length > 0
      ? parseFloat((ratingsData.reduce((sum, r) => sum + r, 0) / ratingsData.length).toFixed(2))
      : 0;

    const ratingDistribution: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    ratingsData.forEach(rating => {
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating.toString()]++;
      }
    });

    // Group forms by employee
    const reviewsByEmployee = new Map<string, any[]>();
    forms.forEach(form => {
      if (!reviewsByEmployee.has(form.employeeId)) {
        reviewsByEmployee.set(form.employeeId, []);
      }
      reviewsByEmployee.get(form.employeeId)!.push(form);
    });

    // Build reviews structure
    const reviews = Array.from(reviewsByEmployee.entries()).map(([employeeId, employeeForms]) => {
      const employee = userMap.get(employeeId);
      const employeeReviews = employeeForms.map(form => {
        const reviewer = userMap.get(form.reviewerId);
        return {
          reviewerId: form.reviewerId,
          reviewerName: reviewer?.name || 'Unknown',
          reviewerType: form.reviewerType,
          overallRating: form.overallRating,
          goalsAchievement: form.goalsAchievement,
          strengths: form.strengths,
          improvements: form.improvements,
          kpiScores: form.kpiScores,
          additionalComments: form.additionalComments,
          submittedAt: form.submittedAt,
        };
      });

      // Calculate employee's average rating
      const employeeRatings = employeeForms
        .filter(f => f.overallRating !== null)
        .map(f => f.overallRating!);

      const employeeAverageRating = employeeRatings.length > 0
        ? parseFloat((employeeRatings.reduce((sum, r) => sum + r, 0) / employeeRatings.length).toFixed(2))
        : 0;

      return {
        employeeId,
        employeeName: employee?.name || 'Unknown',
        employeeEmail: employee?.email || 'unknown@example.com',
        reviews: employeeReviews,
        averageRating: employeeAverageRating,
        reviewCount: employeeForms.length,
      };
    });

    // Sort reviews by employee name
    reviews.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    // Build response
    const response = {
      cycle: {
        id: cycleData.id,
        name: cycleData.name,
        cycleType: cycleData.cycleType,
        startDate: cycleData.startDate,
        endDate: cycleData.endDate,
        status: cycleData.status,
      },
      statistics: {
        totalEmployees,
        totalReviews,
        submittedReviews,
        averageRating,
        ratingDistribution,
      },
      reviews,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET /api/reviews/export/[cycleId] error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}