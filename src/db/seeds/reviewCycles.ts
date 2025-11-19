import { db } from '@/db';
import { reviewCycles, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Get the first user from the user table to use as createdBy
    const firstUser = await db.select().from(user).limit(1);
    
    if (!firstUser || firstUser.length === 0) {
        throw new Error('No users found in the database. Please seed users first.');
    }
    
    const createdByUserId = firstUser[0].id;
    const currentTimestamp = new Date().toISOString();
    
    const sampleReviewCycles = [
        {
            name: 'H1 2025 Review',
            cycleType: '6-month',
            startDate: '2025-01-01',
            endDate: '2025-06-30',
            status: 'active',
            createdBy: createdByUserId,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'H2 2024 Review',
            cycleType: '6-month',
            startDate: '2024-07-01',
            endDate: '2024-12-31',
            status: 'completed',
            createdBy: createdByUserId,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            name: 'Annual 2025 Review',
            cycleType: '1-year',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'draft',
            createdBy: createdByUserId,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(reviewCycles).values(sampleReviewCycles);
    
    console.log('✅ Review cycles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});