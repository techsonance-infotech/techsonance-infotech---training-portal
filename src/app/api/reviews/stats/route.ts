import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviewForms, reviewerAssignments, reviewCycles, user } from '@/db/schema';
import { eq, and, or, count, avg, sql, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cycleIdParam = searchParams.get('cycleId');
    const cycleId = cycleIdParam ? parseInt(cycleIdParam) : null;

    const userRole = currentUser.role;

    if (userRole === 'admin' || userRole === 'hr') {
      // Admin/HR statistics
      const stats: any = {};

      // Total cycles
      const totalCyclesResult = await db.select({ count: count() })
        .from(reviewCycles);
      stats.totalCycles = totalCyclesResult[0]?.count || 0;

      // Active cycles
      const activeCyclesResult = await db.select({ count: count() })
        .from(reviewCycles)
        .where(eq(reviewCycles.status, 'active'));
      stats.activeCycles = activeCyclesResult[0]?.count || 0;

      // Total forms (filtered by cycleId if provided)
      let totalFormsQuery = db.select({ count: count() }).from(reviewForms);
      if (cycleId) {
        totalFormsQuery = totalFormsQuery.where(eq(reviewForms.cycleId, cycleId));
      }
      const totalFormsResult = await totalFormsQuery;
      stats.totalForms = totalFormsResult[0]?.count || 0;

      // Submitted forms
      let submittedFormsQuery = db.select({ count: count() })
        .from(reviewForms)
        .where(eq(reviewForms.status, 'submitted'));
      if (cycleId) {
        submittedFormsQuery = submittedFormsQuery.where(
          and(
            eq(reviewForms.status, 'submitted'),
            eq(reviewForms.cycleId, cycleId)
          )
        );
      }
      const submittedFormsResult = await submittedFormsQuery;
      stats.submittedForms = submittedFormsResult[0]?.count || 0;

      // Pending forms
      let pendingFormsQuery = db.select({ count: count() })
        .from(reviewForms)
        .where(eq(reviewForms.status, 'pending'));
      if (cycleId) {
        pendingFormsQuery = pendingFormsQuery.where(
          and(
            eq(reviewForms.status, 'pending'),
            eq(reviewForms.cycleId, cycleId)
          )
        );
      }
      const pendingFormsResult = await pendingFormsQuery;
      stats.pendingForms = pendingFormsResult[0]?.count || 0;

      // Draft forms
      let draftFormsQuery = db.select({ count: count() })
        .from(reviewForms)
        .where(eq(reviewForms.status, 'draft'));
      if (cycleId) {
        draftFormsQuery = draftFormsQuery.where(
          and(
            eq(reviewForms.status, 'draft'),
            eq(reviewForms.cycleId, cycleId)
          )
        );
      }
      const draftFormsResult = await draftFormsQuery;
      stats.draftForms = draftFormsResult[0]?.count || 0;

      // Total assignments
      let totalAssignmentsQuery = db.select({ count: count() }).from(reviewerAssignments);
      if (cycleId) {
        totalAssignmentsQuery = totalAssignmentsQuery.where(eq(reviewerAssignments.cycleId, cycleId));
      }
      const totalAssignmentsResult = await totalAssignmentsQuery;
      stats.totalAssignments = totalAssignmentsResult[0]?.count || 0;

      // Completed assignments
      let completedAssignmentsQuery = db.select({ count: count() })
        .from(reviewerAssignments)
        .where(eq(reviewerAssignments.status, 'completed'));
      if (cycleId) {
        completedAssignmentsQuery = completedAssignmentsQuery.where(
          and(
            eq(reviewerAssignments.status, 'completed'),
            eq(reviewerAssignments.cycleId, cycleId)
          )
        );
      }
      const completedAssignmentsResult = await completedAssignmentsQuery;
      stats.completedAssignments = completedAssignmentsResult[0]?.count || 0;

      // Overdue assignments
      let overdueAssignmentsQuery = db.select({ count: count() })
        .from(reviewerAssignments)
        .where(eq(reviewerAssignments.status, 'overdue'));
      if (cycleId) {
        overdueAssignmentsQuery = overdueAssignmentsQuery.where(
          and(
            eq(reviewerAssignments.status, 'overdue'),
            eq(reviewerAssignments.cycleId, cycleId)
          )
        );
      }
      const overdueAssignmentsResult = await overdueAssignmentsQuery;
      stats.overdueAssignments = overdueAssignmentsResult[0]?.count || 0;

      // Average rating
      let averageRatingQuery = db.select({ avg: avg(reviewForms.overallRating) })
        .from(reviewForms)
        .where(eq(reviewForms.status, 'submitted'));
      if (cycleId) {
        averageRatingQuery = averageRatingQuery.where(
          and(
            eq(reviewForms.status, 'submitted'),
            eq(reviewForms.cycleId, cycleId)
          )
        );
      }
      const averageRatingResult = await averageRatingQuery;
      stats.averageRating = averageRatingResult[0]?.avg 
        ? parseFloat(averageRatingResult[0].avg.toFixed(2)) 
        : null;

      // Forms by type
      let formsByTypeQuery = db.select({
        reviewerType: reviewForms.reviewerType,
        count: count()
      })
        .from(reviewForms)
        .groupBy(reviewForms.reviewerType);
      
      if (cycleId) {
        formsByTypeQuery = db.select({
          reviewerType: reviewForms.reviewerType,
          count: count()
        })
          .from(reviewForms)
          .where(eq(reviewForms.cycleId, cycleId))
          .groupBy(reviewForms.reviewerType);
      }
      
      const formsByTypeResult = await formsByTypeQuery;
      stats.formsByType = formsByTypeResult.reduce((acc: any, row: any) => {
        acc[row.reviewerType] = row.count;
        return acc;
      }, {});

      // Forms by status
      let formsByStatusQuery = db.select({
        status: reviewForms.status,
        count: count()
      })
        .from(reviewForms)
        .groupBy(reviewForms.status);
      
      if (cycleId) {
        formsByStatusQuery = db.select({
          status: reviewForms.status,
          count: count()
        })
          .from(reviewForms)
          .where(eq(reviewForms.cycleId, cycleId))
          .groupBy(reviewForms.status);
      }
      
      const formsByStatusResult = await formsByStatusQuery;
      stats.formsByStatus = formsByStatusResult.reduce((acc: any, row: any) => {
        acc[row.status] = row.count;
        return acc;
      }, {});

      return NextResponse.json({
        role: userRole,
        stats
      });

    } else {
      // Employee/Intern statistics
      const stats: any = {};

      // My pending reviews (where I am the reviewer)
      let myPendingReviewsQuery = db.select({ count: count() })
        .from(reviewForms)
        .where(
          and(
            eq(reviewForms.reviewerId, currentUser.id),
            or(
              eq(reviewForms.status, 'pending'),
              eq(reviewForms.status, 'draft')
            )
          )
        );
      if (cycleId) {
        myPendingReviewsQuery = db.select({ count: count() })
          .from(reviewForms)
          .where(
            and(
              eq(reviewForms.reviewerId, currentUser.id),
              eq(reviewForms.cycleId, cycleId),
              or(
                eq(reviewForms.status, 'pending'),
                eq(reviewForms.status, 'draft')
              )
            )
          );
      }
      const myPendingReviewsResult = await myPendingReviewsQuery;
      stats.myPendingReviews = myPendingReviewsResult[0]?.count || 0;

      // My completed reviews (where I am the reviewer)
      let myCompletedReviewsQuery = db.select({ count: count() })
        .from(reviewForms)
        .where(
          and(
            eq(reviewForms.reviewerId, currentUser.id),
            eq(reviewForms.status, 'submitted')
          )
        );
      if (cycleId) {
        myCompletedReviewsQuery = db.select({ count: count() })
          .from(reviewForms)
          .where(
            and(
              eq(reviewForms.reviewerId, currentUser.id),
              eq(reviewForms.cycleId, cycleId),
              eq(reviewForms.status, 'submitted')
            )
          );
      }
      const myCompletedReviewsResult = await myCompletedReviewsQuery;
      stats.myCompletedReviews = myCompletedReviewsResult[0]?.count || 0;

      // Reviews about me (where I am the employee)
      let reviewsAboutMeQuery = db.select({ count: count() })
        .from(reviewForms)
        .where(
          and(
            eq(reviewForms.employeeId, currentUser.id),
            eq(reviewForms.status, 'submitted')
          )
        );
      if (cycleId) {
        reviewsAboutMeQuery = db.select({ count: count() })
          .from(reviewForms)
          .where(
            and(
              eq(reviewForms.employeeId, currentUser.id),
              eq(reviewForms.cycleId, cycleId),
              eq(reviewForms.status, 'submitted')
            )
          );
      }
      const reviewsAboutMeResult = await reviewsAboutMeQuery;
      stats.reviewsAboutMe = reviewsAboutMeResult[0]?.count || 0;

      // My average rating (where I am the employee)
      let myAverageRatingQuery = db.select({ avg: avg(reviewForms.overallRating) })
        .from(reviewForms)
        .where(
          and(
            eq(reviewForms.employeeId, currentUser.id),
            eq(reviewForms.status, 'submitted')
          )
        );
      if (cycleId) {
        myAverageRatingQuery = db.select({ avg: avg(reviewForms.overallRating) })
          .from(reviewForms)
          .where(
            and(
              eq(reviewForms.employeeId, currentUser.id),
              eq(reviewForms.cycleId, cycleId),
              eq(reviewForms.status, 'submitted')
            )
          );
      }
      const myAverageRatingResult = await myAverageRatingQuery;
      stats.myAverageRating = myAverageRatingResult[0]?.avg 
        ? parseFloat(myAverageRatingResult[0].avg.toFixed(2)) 
        : null;

      // Upcoming deadlines (assignments where I am the reviewer and status is pending)
      let upcomingDeadlinesQuery = db.select({
        id: reviewerAssignments.id,
        cycleId: reviewerAssignments.cycleId,
        employeeId: reviewerAssignments.employeeId,
        reviewerType: reviewerAssignments.reviewerType,
        createdAt: reviewerAssignments.createdAt,
        cycleName: reviewCycles.name,
        cycleEndDate: reviewCycles.endDate
      })
        .from(reviewerAssignments)
        .leftJoin(reviewCycles, eq(reviewerAssignments.cycleId, reviewCycles.id))
        .where(
          and(
            eq(reviewerAssignments.reviewerId, currentUser.id),
            eq(reviewerAssignments.status, 'pending')
          )
        );
      
      if (cycleId) {
        upcomingDeadlinesQuery = db.select({
          id: reviewerAssignments.id,
          cycleId: reviewerAssignments.cycleId,
          employeeId: reviewerAssignments.employeeId,
          reviewerType: reviewerAssignments.reviewerType,
          createdAt: reviewerAssignments.createdAt,
          cycleName: reviewCycles.name,
          cycleEndDate: reviewCycles.endDate
        })
          .from(reviewerAssignments)
          .leftJoin(reviewCycles, eq(reviewerAssignments.cycleId, reviewCycles.id))
          .where(
            and(
              eq(reviewerAssignments.reviewerId, currentUser.id),
              eq(reviewerAssignments.cycleId, cycleId),
              eq(reviewerAssignments.status, 'pending')
            )
          );
      }

      const upcomingDeadlinesResult = await upcomingDeadlinesQuery;
      stats.upcomingDeadlines = upcomingDeadlinesResult.map((assignment: any) => ({
        id: assignment.id,
        cycleId: assignment.cycleId,
        cycleName: assignment.cycleName,
        cycleEndDate: assignment.cycleEndDate,
        employeeId: assignment.employeeId,
        reviewerType: assignment.reviewerType,
        createdAt: assignment.createdAt
      }));

      return NextResponse.json({
        role: userRole,
        stats
      });
    }

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}