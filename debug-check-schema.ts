
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    console.log("Checking schema for 'portfolios' table...");
    try {
        const result = await db.run(sql`PRAGMA table_info(portfolios)`);
        console.log("Schema info:", JSON.stringify(result, null, 2));

        const rows = await db.run(sql`SELECT sql FROM sqlite_master WHERE name = 'portfolios'`);
        console.log("Table creation SQL:", JSON.stringify(rows, null, 2));

    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkSchema();
