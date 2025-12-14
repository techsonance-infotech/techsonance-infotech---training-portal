import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or, and, desc, ne, not } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { hashPassword } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = (page - 1) * limit;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Start with base query builder
    let queryBuilder = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      image: users.image,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).orderBy(desc(users.createdAt)).$dynamic();

    const conditions = [];

    if (role) {
      if (!['admin', 'employee', 'intern'].includes(role)) {
        return NextResponse.json({
          error: "Invalid role filter. Must be 'admin', 'employee', or 'intern'",
          code: "INVALID_ROLE_FILTER"
        }, { status: 400 });
      }
      conditions.push(eq(users.role, role));
    }

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          like(users.name, searchTerm),
          like(users.email, searchTerm)
        )
      );
    }

    if (status) {
      if (status.startsWith('!')) {
        const val = status.substring(1);
        console.log('[API] Adding NOT_EQ filter:', val);
        conditions.push(not(eq(users.status, val)));
      } else {
        conditions.push(eq(users.status, status));
      }
    }

    if (conditions.length > 0) {
      console.log('[API] Query conditions count:', conditions.length);
      if (conditions.length === 1) {
        queryBuilder = queryBuilder.where(conditions[0]);
      } else {
        queryBuilder = queryBuilder.where(and(...conditions));
      }
    }

    const results = await queryBuilder.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  console.time(`[${requestId}] POST /api/users total`);

  try {
    console.log(`[${requestId}] Starting user creation`);

    const body = await request.json();
    console.log(`[${requestId}] Body parsed`);

    const { firstName, lastName, email, password, role } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      return NextResponse.json({
        error: "First Name is required",
        code: "MISSING_FIRST_NAME"
      }, { status: 400 });
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      return NextResponse.json({
        error: "Last Name is required",
        code: "MISSING_LAST_NAME"
      }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({
        error: "Email is required and must be a non-empty string",
        code: "MISSING_EMAIL"
      }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return NextResponse.json({
        error: "Password is required and must be a non-empty string",
        code: "MISSING_PASSWORD"
      }, { status: 400 });
    }

    // Role validation - default to intern if not provided, or validate if provided
    const requestedRole = role ? role.trim().toLowerCase() : 'intern';

    // Validate role (cannot create admin users via API for public registration)
    if (requestedRole === 'admin') {
      return NextResponse.json({
        error: "Cannot create admin users via API",
        code: "INVALID_ROLE"
      }, { status: 400 });
    }

    if (!['employee', 'intern'].includes(requestedRole)) {
      return NextResponse.json({
        error: "Role must be employee or intern",
        code: "INVALID_ROLE"
      }, { status: 400 });
    }

    // Sanitize inputs
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullName = `${trimmedFirstName} ${trimmedLastName}`;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate email format (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT"
      }, { status: 400 });
    }

    // Validate password length
    if (trimmedPassword.length < 8) {
      return NextResponse.json({
        error: "Password must be at least 8 characters long",
        code: "PASSWORD_TOO_SHORT"
      }, { status: 400 });
    }

    console.log(`[${requestId}] Validation passed. Checking existing user...`);
    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);
    console.log(`[${requestId}] Existing user check complete. Result:`, existingUser.length > 0);

    if (existingUser.length > 0) {
      return NextResponse.json({
        error: "Email already exists",
        code: "DUPLICATE_EMAIL"
      }, { status: 409 });
    }

    // Generate UUID for user
    const userId = randomUUID();

    // Hash password using new auth utils
    console.time(`[${requestId}] hashPassword`);
    const hashedPassword = await hashPassword(trimmedPassword);
    console.timeEnd(`[${requestId}] hashPassword`);

    const now = new Date();

    console.log(`[${requestId}] Inserting user into DB...`);
    console.time(`[${requestId}] db.insert`);
    // Insert user with INACTIVE status
    const newUser = await db.insert(users)
      .values({
        id: userId,
        name: fullName,
        email: trimmedEmail,
        passwordHash: hashedPassword,
        image: null,
        role: requestedRole,
        status: 'inactive', // Default to inactive for public registration
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    console.timeEnd(`[${requestId}] db.insert`);
    console.log(`[${requestId}] User inserted successfully.`);

    console.timeEnd(`[${requestId}] POST /api/users total`);
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.timeEnd(`[${requestId}] POST /api/users total`);
    console.error(`[${requestId}] POST /api/users error:`, error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}