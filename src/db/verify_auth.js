
const { db } = require('@/db');
const { user, account } = require('@/db/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function testAuth() {
    const testEmail = `test.debug.js.${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    console.log(`--- Starting Auth Verification Test (JS) ---`);
    console.log(`Target: ${testEmail}`);
    console.log(`Password: ${testPassword}`);

    // 1. Simulate API Creation Logic
    console.log('\nSTEP 1: Creating User (Simulating API)...');
    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const now = new Date();

    await db.insert(user).values({
        id: userId,
        name: 'Debug User JS',
        email: testEmail,
        emailVerified: true,
        image: null,
        role: 'employee',
        createdAt: now,
        updatedAt: now,
    });

    await db.insert(account).values({
        id: randomUUID(),
        userId: userId,
        accountId: testEmail, // Matching current API logic
        providerId: 'credential',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
    });
    console.log('User and Account created.');

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
