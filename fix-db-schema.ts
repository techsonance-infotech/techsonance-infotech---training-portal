
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("Fixing schema...");
    try {
        // 1. Drop existing tables (child first)
        console.log("Dropping portfolio_items...");
        await db.run(sql`DROP TABLE IF EXISTS portfolio_items`);

        console.log("Dropping portfolios...");
        await db.run(sql`DROP TABLE IF EXISTS portfolios`);

        // 2. Create portfolios table with correct FK to 'users'
        console.log("Creating portfolios table...");
        await db.run(sql`
      CREATE TABLE "portfolios" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" text NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 3. Create unique index on user_id
        console.log("Creating unique index on portfolios.user_id...");
        await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS "portfolios_user_id_unique" ON "portfolios" ("user_id")`);

        // 4. Create portfolio_items table
        console.log("Creating portfolio_items table...");
        await db.run(sql`
      CREATE TABLE "portfolio_items" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "portfolio_id" integer,
        "category" text NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "created_at" text NOT NULL,
        FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        console.log("Schema fix completed successfully.");

    } catch (error) {
        console.error("Error fixing schema:", error);
    }
}

fixSchema();
