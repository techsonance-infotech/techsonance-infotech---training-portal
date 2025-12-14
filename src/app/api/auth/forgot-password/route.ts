
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            return NextResponse.json({
                // Don't reveal if user exists for security
                message: "If an account exists with this email, you will receive an OTP."
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await db.insert(passwordResets).values({
            id: randomUUID(),
            email: user.email,
            otp,
            expiresAt,
        });

        // Simulate sending email (log to console)
        console.log(`[Forgot Password] OTP for ${user.email}: ${otp}`);

        return NextResponse.json({
            message: "If an account exists with this email, you will receive an OTP."
        });

    } catch (error) {
        console.error("Forgot Password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
