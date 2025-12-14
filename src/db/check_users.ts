
import { db } from '@/db';
import { user } from '@/db/schema';
import { count } from 'drizzle-orm';

async function main() {
    try {
        const userCount = await db.select({ count: count() }).from(user);
        console.log('User count:', userCount[0].count);

        const users = await db.select().from(user);
        console.log('Users found:', users.map(u => ({ email: u.email, role: u.role, id: u.id })));

    } catch (error) {
        console.error('Error checking users:', error);
    }
}

main();
