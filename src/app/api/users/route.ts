import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, like, or, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = (page - 1) * limit;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Start with base query builder
    let queryBuilder = db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }).from(user).$dynamic();

    const conditions = [];

    if (role) {
      if (!['admin', 'employee', 'intern'].includes(role)) {
        return NextResponse.json({ 
          error: "Invalid role filter. Must be 'admin', 'employee', or 'intern'",
          code: "INVALID_ROLE_FILTER" 
        }, { status: 400 });
      }
      conditions.push(eq(user.role, role));
    }

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          like(user.name, searchTerm),
          like(user.email, searchTerm)
        )
      );
    }

    if (conditions.length > 0) {
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
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_NAME" 
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

    if (!role || typeof role !== 'string' || role.trim() === '') {
      return NextResponse.json({ 
        error: "Role is required and must be a non-empty string",
        code: "MISSING_ROLE" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedRole = role.trim().toLowerCase();

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

    // Validate role (cannot create admin users via API)
    if (trimmedRole === 'admin') {
      return NextResponse.json({ 
        error: "Cannot create admin users via API",
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    if (!['employee', 'intern'].includes(trimmedRole)) {
      return NextResponse.json({ 
        error: "Role must be employee or intern",
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, trimmedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "Email already exists",
        code: "DUPLICATE_EMAIL" 
      }, { status: 409 });
    }

    // Generate UUID for user
    const userId = randomUUID();

    // Hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Insert user
    const newUser = await db.insert(user)
      .values({
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
        emailVerified: false,
        image: null,
        role: trimmedRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

    // Insert account with hashed password
    await db.insert(account)
      .values({
        id: randomUUID(),
        accountId: trimmedEmail,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}