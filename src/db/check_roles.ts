import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    try {
        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            role: users.role
        }).from(users);
        console.log('Users in DB:');
        allUsers.forEach(u => console.log(`${u.email}: ${u.role} `));
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
