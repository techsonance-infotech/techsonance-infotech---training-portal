import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { db } from './index';
import { users } from './schema';
import { desc } from 'drizzle-orm';

async function main() {
    try {
        console.log('Fetching all users from database...');
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

        console.log(`Found ${allUsers.length} users:`);
        allUsers.forEach(u => {
            console.log(`- [${u.status}] ${u.email} (Role: ${u.role}, ID: ${u.id})`);
        });

    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

main();
