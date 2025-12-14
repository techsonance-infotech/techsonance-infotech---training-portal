
import 'dotenv/config'; // Load env vars
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function testAuth() {
    const testEmail = `test.debug.${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    console.log(`--- Starting Auth Verification Test ---`);
    console.log(`Target: ${testEmail}`);
    console.log(`Password: ${testPassword}`);

    // 1. Simulate
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, testEmail)
    });

    if (!existingUser) {
        console.log(`User ${testEmail} does not exist. Creating...`);

        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const userId = randomUUID();
        const now = new Date();

        await db.insert(users).values({
            id: userId,
            name: 'Test Administrator',
            email: testEmail,
            passwordHash: hashedPassword,
            role: 'admin',
            createdAt: now,
            updatedAt: now,
        });

        console.log(`User ${testEmail} created with ID ${userId}`);
    } else {
        console.log(`User ${testEmail} already exists.`);
        // Optional: Verify password or update it
    }

    // 2. Verify Logic
    console.log('\nSTEP 2: Verifying Password...');

    // Fetch account
    const storedAccount = await db
        .select()
        .from(account)
        .where(eq(account.accountId, testEmail)) // Querying by accountId = email
        .limit(1);

    if (storedAccount.length === 0) {
        console.error('❌ ERROR: Account not found by accountId = email');
    } else {
        console.log('✅ Account found.');
        const acc = storedAccount[0];
        console.log(`   Hash in DB: ${acc.password?.substring(0, 10)}...`);

        const isMatch = await bcrypt.compare(testPassword, acc.password || '');
        console.log(`   bcryptjs.compare result: ${isMatch ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
}

testAuth().catch(console.error);
