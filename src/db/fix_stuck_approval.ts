
import { db } from '@/db';
import { employeeOnboarding, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function fixStucksubmissions() {
    console.log('Checking for stuck submissions...');

    // Get all approved submissions
    const approvedSubmissions = await db
        .select()
        .from(employeeOnboarding)
        .where(eq(employeeOnboarding.status, 'approved'));

    console.log(`Found ${approvedSubmissions.length} approved submissions.`);

    for (const sub of approvedSubmissions) {
        // Check if user exists
        const userRecord = await db
            .select()
            .from(user)
            .where(eq(user.email, sub.personalEmail));

        if (userRecord.length === 0) {
            console.log(`Submission ID ${sub.id} (${sub.fullName}) is APPROVED but has NO USER ACCOUNT.`);
            console.log('Resetting status to PENDING...');

            await db
                .update(employeeOnboarding)
                .set({ status: 'pending' })
                .where(eq(employeeOnboarding.id, sub.id));

            console.log('Reset complete.');
        } else {
            console.log(`Submission ID ${sub.id} is OK (User exists).`);
        }
    }
}

fixStucksubmissions().then(() => console.log('Done')).catch(console.error);
