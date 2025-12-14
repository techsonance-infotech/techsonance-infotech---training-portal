
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkUsersSchema() {
    console.log("Checking schema for 'users' table...");
    try {
        const rows = await db.run(sql`SELECT sql FROM sqlite_master WHERE name = 'users'`);
        console.log("Table creation SQL for 'users':", JSON.stringify(rows, null, 2));

        // Check if 'user' table exists
        const rowsUser = await db.run(sql`SELECT sql FROM sqlite_master WHERE name = 'user'`);
        console.log("Table creation SQL for 'user':", JSON.stringify(rowsUser, null, 2));

    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkUsersSchema();
