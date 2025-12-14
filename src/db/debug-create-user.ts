
import { db } from './index';
import { users } from './schema';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Load environment variables
dotenv.config();

async function main() {
    console.log('Starting debug user creation...');

    try {
        const testEmail = `debug-${Date.now()}@test.com`;
        const testPassword = 'Password123!';

        console.log('1. Testing Password Hashing...');
        console.time('hashPassword');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        console.timeEnd('hashPassword');
        console.log('Password hashed successfully.');

        console.log('2. Preparing User Data...');
        const newUser = {
            id: randomUUID(),
            name: 'Debug User',
            email: testEmail,
            role: 'intern', // valid role
            status: 'inactive',
            image: null,
            passwordHash: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log('3. Inserting into Database...');
        console.time('db.insert');
        const result = await db.insert(users).values(newUser).returning();
        console.timeEnd('db.insert');

        console.log('4. Insertion Result:', result);
        console.log('SUCCESS: User created successfully in standalone script.');

    } catch (error) {
        console.error('FAILURE: Debug script failed.');
        console.error(error);
    } finally {
        process.exit(0);
    }
}

main();
