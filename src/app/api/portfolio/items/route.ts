import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { portfolios, portfolioItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = [
  'qualification',
  'certification',
  'skill',
  'industry_knowledge',
  'personal_quality'
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, title, description } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        {
          error: 'userId is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    if (typeof userId !== 'string') {
      return NextResponse.json(
        {
          error: 'userId must be a string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error: 'category is required',
          code: 'MISSING_CATEGORY'
        },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY'
        },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        {
          error: 'title is required and must be a non-empty string',
          code: 'INVALID_TITLE'
        },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return NextResponse.json(
        {
          error: 'description must be a string or null',
          code: 'INVALID_DESCRIPTION'
        },
        { status: 400 }
      );
    }

    // Check if portfolio exists for userId
    const existingPortfolio = await db.select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .limit(1);

    let portfolioId: number;

    if (existingPortfolio.length === 0) {
      // Create new portfolio
      const timestamp = new Date().toISOString();
      const newPortfolio = await db.insert(portfolios)
        .values({
          userId,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();

      portfolioId = newPortfolio[0].id;
    } else {
      portfolioId = existingPortfolio[0].id;
    }

    // Create portfolio item
    const newPortfolioItem = await db.insert(portfolioItems)
      .values({
        portfolioId,
        category: category.trim(),
        title: title.trim(),
        description: description ? description.trim() : null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newPortfolioItem[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}