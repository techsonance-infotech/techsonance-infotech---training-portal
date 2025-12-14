
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkCoursesSchema() {
    console.log("Checking schema for 'courses' table...");
    try {
        const rows: any = await db.run(sql`SELECT sql FROM sqlite_master WHERE name = 'courses'`);
        console.log("Table creation SQL for 'courses':", JSON.stringify(rows, null, 2));

        // Also check course_assignments just in case
        const rows2: any = await db.run(sql`SELECT sql FROM sqlite_master WHERE name = 'course_assignments'`);
        console.log("Table creation SQL for 'course_assignments':", JSON.stringify(rows2, null, 2));

    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkCoursesSchema();
