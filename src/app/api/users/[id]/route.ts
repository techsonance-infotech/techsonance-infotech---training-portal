import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ID is valid (optional, but good practice if using uuids/ints)
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const start = Date.now();
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[Slow Query] Fetching user ${id} took ${duration}ms`);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Exclude password hash from response
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, password } = body;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      name,
      email,
      role,
      updatedAt: new Date(),
    };

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id));

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}