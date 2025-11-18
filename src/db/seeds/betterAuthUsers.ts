import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const usersData = [
        {
            email: 'admin@company.com',
            password: 'Admin123!',
            name: 'Admin User',
            role: 'admin'
        },
        {
            email: 'john.doe@company.com',
            password: 'Employee123!',
            name: 'John Doe',
            role: 'employee'
        },
        {
            email: 'intern@company.com',
            password: 'Intern123!',
            name: 'Intern User',
            role: 'intern'
        }
    ];

    for (const userData of usersData) {
        try {
            const result = await auth.api.signUpEmail({
                body: {
                    email: userData.email,
                    password: userData.password,
                    name: userData.name
                }
            });

            if (result?.user?.id) {
                await db.update(user)
                    .set({ role: userData.role })
                    .where(eq(user.id, result.user.id));

                console.log(`✅ Successfully created user: ${userData.name} (${userData.email}) with role: ${userData.role}`);
            }
        } catch (error) {
            console.error(`❌ Failed to create user ${userData.email}:`, error);
        }
    }

    console.log('✅ Better-auth users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});