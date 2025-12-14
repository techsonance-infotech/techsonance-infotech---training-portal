
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkAllFKs() {
    console.log("Checking all tables for references to legacy 'user' table...");
    try {
        // Just fetch all tables and filter in JS to be sure
        const allTables: any = await db.run(sql`SELECT name, sql FROM sqlite_master WHERE type='table'`);

        // We expect result to be an array of objects if asking specifically, but run() returns ResultSet.
        // drizzle run() might return array of rows if just SELECT?
        // Let's print raw first.

        // Using .all() if available? Drizzle SQLite `run` usually returns metadata. 
        // We should use .all() or .values() if using prepared statements, or just inspect what query returns.
        // For raw SQL query in Drizzle, db.all() is not standard. db.select() is.
        // But we are selecting from sqlite_master which is not defined in schema.

        // Workaround: We can't easily iterate result of db.run() for rows in all drivers.
        // But with better-sqlite3 (likely used) it returns { ... rows: [] } or checked previously it showed "rows": [...]

        const legacyReferences: { table: string, sql: string }[] = [];

        // Manually parse the JSON output format we saw in previous steps which had "rows": [...]
        if (allTables && allTables.rows) {
            for (const row of allTables.rows) {
                // row is [sql, name] or similar? No, standard SELECT name, sql
                // In previous output: columns: ["sql"], rows: [["CREATE..."]]

                // Wait, previous output for SELECT sql was:
                // "columns": ["sql"], "rows": [["CREATE TABLE ..."]]

                // So if I select name, sql:
                // "columns": ["name", "sql"], "rows": [["tablename", "CREATE TABLE..."]]

                const tableName = row[0]; // name
                const tableSql = row[1]; // sql

                if (tableSql && (tableSql.includes('REFERENCES "user"') || tableSql.includes('REFERENCES user'))) {
                    // Exclude if it's "users"
                    // Check if it is NOT "users"
                    // Regex needed
                    if (/REFERENCES \"?user\"?[^\w]/.test(tableSql)) {
                        // It references user, not users (assuming 's' would be \w)
                        // Be careful with "user_id"
                        legacyReferences.push({ table: tableName, sql: tableSql });
                    }
                }
            }
        }

        console.log("Found legacy references:", JSON.stringify(legacyReferences, null, 2));

    } catch (error) {
        console.error("Error checking FKs:", error);
    }
}

checkAllFKs();
