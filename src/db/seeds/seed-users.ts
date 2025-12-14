import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';

async function main() {
    console.log('Seeding users...');

    const usersData = [
        {
            name: 'Admin User',
            email: 'admin@company.com',
            password: 'Admin123!',
            role: 'admin',
        },
        {
            name: 'John Doe',
            email: 'john.doe@company.com',
            password: 'Employee123!',
            role: 'employee',
        },
        {
            name: 'Intern User',
            email: 'intern@company.com',
            password: 'Intern123!',
            role: 'intern',
        },
    ];

    for (const userData of usersData) {
        const passwordHash = await hashPassword(userData.password);

        // Check if user exists (by email) - simplified upsert
        // Actually we will just insert if not exists to act as seeder
        // But since we are rebuilding, we can assume we might want to ensure they exist.

        // Check existing
        const existing = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, userData.email)
        });

        if (!existing) {
            await db.insert(users).values({
                id: randomUUID(),
                name: userData.name,
                email: userData.email,
                passwordHash: passwordHash,
                role: userData.role,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`Created user: ${userData.email}`);
        } else {
            console.log(`User already exists: ${userData.email}`);
        }
    }

    console.log('Seeding completed.');
}

main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
