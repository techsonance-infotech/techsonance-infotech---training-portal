import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const result = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, role } = body;

    // Check if at least one field is provided
    if (!name && !email && !role) {
      return NextResponse.json(
        {
          error: 'At least one field to update is required',
          code: 'NO_FIELDS_PROVIDED',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updates: Partial<typeof user.$inferInsert> = {};

    // Validate and add name
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = trimmedName;
    }

    // Validate and add email
    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail === '') {
        return NextResponse.json(
          { error: 'Email cannot be empty', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }

      // Check for duplicate email
      const duplicateEmail = await db
        .select()
        .from(user)
        .where(and(eq(user.email, trimmedEmail), ne(user.id, id)))
        .limit(1);

      if (duplicateEmail.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
          { status: 409 }
        );
      }

      updates.email = trimmedEmail;

      // Update account.accountId if email is being changed
      if (trimmedEmail !== existingUser[0].email) {
        await db
          .update(account)
          .set({
            accountId: trimmedEmail,
            updatedAt: new Date(),
          })
          .where(eq(account.userId, id));
      }
    }

    // Validate and add role
    if (role !== undefined) {
      const trimmedRole = role.trim();
      const validRoles = ['admin', 'employee', 'intern'];
      if (!validRoles.includes(trimmedRole)) {
        return NextResponse.json(
          {
            error: 'Role must be admin, employee, or intern',
            code: 'INVALID_ROLE',
          },
          { status: 400 }
        );
      }
      updates.role = trimmedRole;
    }

    // Add updatedAt timestamp
    updates.updatedAt = new Date();

    // Update user
    const updatedUser = await db
      .update(user)
      .set(updates)
      .where(eq(user.id, id))
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

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete associated accounts first (cascade will handle this, but explicit is safer)
    await db.delete(account).where(eq(account.userId, id));

    // Delete user
    const deletedUser = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
      });

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        id: id,
        deletedUser: deletedUser[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}