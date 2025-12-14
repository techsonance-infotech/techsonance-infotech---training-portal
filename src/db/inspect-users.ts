
import { db } from '@/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Inspecting users table...');
    const info = await db.run(sql`PRAGMA table_info(users)`);
    console.log(JSON.stringify(info, null, 2));
}

main();
