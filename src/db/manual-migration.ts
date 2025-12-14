
import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Running manual table reset...');

    try {
        // Drop tables
        console.log('Dropping users table...');
        await db.run(sql`DROP TABLE IF EXISTS users`);

        // Recreate users table with correct schema
        console.log('Creating users table...');
        await db.run(sql`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'employee',
                image TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'active'
            )
        `);
        console.log('users table created.');

        // Verify password_resets exists
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS password_resets (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                otp TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            )
        `);
        console.log('password_resets table ensured.');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
