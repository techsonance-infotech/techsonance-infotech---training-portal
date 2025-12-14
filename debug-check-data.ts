
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkData() {
    try {
        const portfoliosCount = await db.run(sql`SELECT count(*) as count FROM portfolios`);
        console.log("Portfolios count:", JSON.stringify(portfoliosCount, null, 2));

        const userCount = await db.run(sql`SELECT count(*) as count FROM user`);
        console.log("User (legacy) table count:", JSON.stringify(userCount, null, 2));

    } catch (error) {
        console.error("Error checking data:", error);
    }
}

checkData();
