import { db } from '@/db';
import { user, account } from '@/db/schema';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

async function main() {
    const plainUsers = [
        {
            email: 'admin@company.com',
            plainPassword: 'Admin123!',
            name: 'Admin User',
            role: 'admin',
            emailVerified: true,
            image: null,
        },
        {
            email: 'john.doe@company.com',
            plainPassword: 'Employee123!',
            name: 'John Doe',
            role: 'employee',
            emailVerified: true,
            image: null,
        },
        {
            email: 'jane.smith@company.com',
            plainPassword: 'Employee123!',
            name: 'Jane Smith',
            role: 'employee',
            emailVerified: true,
            image: null,
        },
        {
            email: 'intern@company.com',
            plainPassword: 'Intern123!',
            name: 'Intern User',
            role: 'intern',
            emailVerified: true,
            image: null,
        },
    ];

    for (const plainUser of plainUsers) {
        const userId = randomUUID();
        const hashedPassword = await bcrypt.hash(plainUser.plainPassword, 10);
        const now = new Date();

        await db.insert(user).values({
            id: userId,
            email: plainUser.email,
            name: plainUser.name,
            role: plainUser.role,
            emailVerified: plainUser.emailVerified,
            image: plainUser.image,
            createdAt: now,
            updatedAt: now,
        });

        const accountId = randomUUID();
        await db.insert(account).values({
            id: accountId,
            accountId: plainUser.email,
            providerId: 'credential',
            userId: userId,
            password: hashedPassword,
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    console.log('✅ User seeder completed successfully - 3 users created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});