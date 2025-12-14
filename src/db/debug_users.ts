
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function debugUsers() {
    try {
        console.log('--- Inspecting Users & Accounts ---');

        const allUsers = await db.select().from(user);
        console.log(`Found ${allUsers.length} users.`);

        for (const u of allUsers) {
            console.log(`User: ${u.name} (${u.email}) [ID: ${u.id}]`);
            console.log(`   - Verified: ${u.emailVerified}, Role: ${u.role}`);

            const accounts = await db.select().from(account).where(eq(account.userId, u.id));
            for (const acc of accounts) {
                console.log(`   - Account: Provider=${acc.providerId}, AccountID=${acc.accountId}`);
                console.log(`   - Password Hash Length: ${acc.password?.length}`);
            }
        }
    } catch (e: any) {
        console.error("FATAL ERROR:", e);
    }
}

debugUsers().catch(console.error);
