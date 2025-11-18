import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companyPolicies } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(companyPolicies);

    if (search) {
      query = query.where(
        or(
          like(companyPolicies.title, `%${search}%`),
          like(companyPolicies.description, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content, documentUrl, required } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string', code: 'INVALID_TITLE' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required and must be a non-empty string', code: 'INVALID_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string', code: 'INVALID_CONTENT' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (documentUrl !== undefined && documentUrl !== null && typeof documentUrl !== 'string') {
      return NextResponse.json(
        { error: 'Document URL must be a string', code: 'INVALID_DOCUMENT_URL' },
        { status: 400 }
      );
    }

    if (required !== undefined && typeof required !== 'boolean') {
      return NextResponse.json(
        { error: 'Required field must be a boolean', code: 'INVALID_REQUIRED_FIELD' },
        { status: 400 }
      );
    }

    const currentTimestamp = new Date().toISOString();

    const newPolicy = await db
      .insert(companyPolicies)
      .values({
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        documentUrl: documentUrl?.trim() || null,
        required: required !== undefined ? required : true,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newPolicy[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}