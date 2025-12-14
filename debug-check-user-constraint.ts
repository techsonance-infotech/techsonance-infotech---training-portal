
import 'dotenv/config';
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkUser() {
    const userId = "a1bf08db-4242-4450-9ff6-64e9102a99fc";
    console.log(`Checking for user with ID: ${userId}`);

    try {
        const user = await db.select().from(users).where(eq(users.id, userId));
        console.log("User found:", JSON.stringify(user, null, 2));
    } catch (error) {
        console.error("Error fetching user:", error);
    }
}

checkUser();
