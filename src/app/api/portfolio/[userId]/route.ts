import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolios, portfolioItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const { userId } = context.params;

    // Validate userId is a valid integer
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        {
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    const parsedUserId = parseInt(userId);

    // Query portfolio by userId
    const portfolioResult = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, parsedUserId))
      .limit(1);

    // If no portfolio exists, return null portfolio with empty items array
    if (portfolioResult.length === 0) {
      return NextResponse.json(
        {
          portfolio: null,
          items: [],
        },
        { status: 200 }
      );
    }

    const portfolio = portfolioResult[0];

    // Query all portfolio items for this portfolio, ordered by createdAt descending
    const items = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.portfolioId, portfolio.id))
      .orderBy(desc(portfolioItems.createdAt));

    // Return portfolio with items
    return NextResponse.json(
      {
        portfolio,
        items,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}