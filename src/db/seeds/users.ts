import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const currentTimestamp = new Date().toISOString();

    const sampleUsers = [
        {
            email: 'admin@company.com',
            passwordHash: await bcrypt.hash('Admin123!', 10),
            fullName: 'System Administrator',
            role: 'admin',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            email: 'john.doe@company.com',
            passwordHash: await bcrypt.hash('Employee123!', 10),
            fullName: 'John Doe',
            role: 'employee',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            email: 'jane.smith@company.com',
            passwordHash: await bcrypt.hash('Employee123!', 10),
            fullName: 'Jane Smith',
            role: 'employee',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            email: 'intern@company.com',
            passwordHash: await bcrypt.hash('Intern123!', 10),
            fullName: 'Alex Johnson',
            role: 'intern',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});