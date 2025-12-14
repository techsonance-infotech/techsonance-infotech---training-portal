
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Activating admin user...');

    await db.update(users)
        .set({ status: 'active' })
        .where(eq(users.email, 'admin@company.com'));

    console.log('Admin user activated.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
