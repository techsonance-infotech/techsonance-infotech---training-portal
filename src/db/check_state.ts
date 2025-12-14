
import { db } from '@/db';
import { employeeOnboarding, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkState() {
    const submissions = await db.select().from(employeeOnboarding);
    console.log('--- Submissions ---');
    for (const s of submissions) {
        console.log(`ID: ${s.id}, Name: ${s.fullName}, Status: ${s.status}, Email: ${s.personalEmail}`);

        const u = await db.select().from(users).where(eq(users.email, s.personalEmail));
        console.log(`   -> User Account Exists? ${u.length > 0 ? "YES" : "NO"}`);
    }
}

checkState().catch(console.error);
