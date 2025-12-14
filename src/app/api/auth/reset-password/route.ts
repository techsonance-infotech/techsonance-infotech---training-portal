
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResets } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Verify OTP
        const validReset = await db.query.passwordResets.findFirst({
            where: and(
                eq(passwordResets.email, email),
                eq(passwordResets.otp, otp),
                gt(passwordResets.expiresAt, new Date())
            )
        });

        if (!validReset) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Update Password
        const hashedPassword = await hashPassword(newPassword);

        await db.update(users)
            .set({ passwordHash: hashedPassword, updatedAt: new Date() })
            .where(eq(users.email, email));

        // Delete used OTP
        await db.delete(passwordResets)
            .where(eq(passwordResets.id, validReset.id));

        return NextResponse.json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset Password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
