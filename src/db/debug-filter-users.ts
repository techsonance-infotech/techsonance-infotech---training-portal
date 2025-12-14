
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from './index';
import { users } from './schema';
import { desc, ne, eq, not, and } from 'drizzle-orm';

async function main() {
    try {
        console.log('--- Debugging Status Filter ---');

        // 1. Fetch ALL users to see what we have
        const allUsers = await db.select({
            email: users.email,
            status: users.status
        }).from(users);
        console.log('All Users:', allUsers);

        // 2. Test NE (Not Equal) 'active'
        console.log('\nTesting ne(users.status, "active")...');
        const nonActiveUsers = await db.select({
            email: users.email,
            status: users.status
        }).from(users).where(ne(users.status, 'active'));

        console.log('Non-Active Users (Count):', nonActiveUsers.length);
        console.log('Non-Active Users:', nonActiveUsers);

        // 3. Test Manual Filter in memory
        const manualFilter = allUsers.filter(u => u.status !== 'active');
        console.log('\nManual Filter Count:', manualFilter.length);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

main();
