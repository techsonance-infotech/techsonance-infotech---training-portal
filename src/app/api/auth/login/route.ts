import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, generateToken } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const start = performance.now();
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });
        console.log(`[Auth] User lookup took ${performance.now() - start}ms`);

        if (!existingUser) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isValidPassword = await verifyPassword(
            password,
            existingUser.passwordHash
        );


        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check if user account is active
        if (existingUser.status !== 'active') {
            return NextResponse.json(
                { error: "Your account is pending approval. Please contact the administrator." },
                { status: 403 }
            );
        }

        const token = generateToken({ userId: existingUser.id, role: existingUser.role });

        const response = NextResponse.json({
            user: {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                image: existingUser.image,
            },
        });

        // Set HTTP-only cookie
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
