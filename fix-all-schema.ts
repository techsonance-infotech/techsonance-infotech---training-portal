
import 'dotenv/config';
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function fixAllSchema() {
    console.log("Starting full schema refactor (User vs Users)...");
    try {
        // === DROP TABLES (Child first) ===
        const tablesToDrop = [
            "portfolio_items",
            "portfolios",
            "policy_completions",
            "course_assignments",
            "activities",
            "topics",
            "courses",
            "feedback_responses",
            "feedback_requests",
            "review_comments",
            "review_notifications",
            "reviewer_assignments",
            "review_forms",
            "appraisals",
            "review_cycles",
            "employee_onboarding"
        ];

        for (const table of tablesToDrop) {
            console.log(`Dropping ${table}...`);
            await db.run(sql.raw(`DROP TABLE IF EXISTS "${table}"`));
        }

        // === RECREATE TABLES (Parent first) ===

        // 1. Review Cycles (Referenced by many)
        console.log("Creating review_cycles...");
        await db.run(sql`
      CREATE TABLE "review_cycles" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" text NOT NULL,
        "cycle_type" text NOT NULL,
        "start_date" text NOT NULL,
        "end_date" text NOT NULL,
        "status" text DEFAULT 'draft' NOT NULL,
        "created_by" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 2. Courses
        console.log("Creating courses...");
        await db.run(sql`
      CREATE TABLE "courses" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "start_date" text NOT NULL,
        "end_date" text NOT NULL,
        "created_by" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 3. Topics
        console.log("Creating topics...");
        await db.run(sql`
      CREATE TABLE "topics" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "course_id" integer,
        "title" text NOT NULL,
        "content" text NOT NULL,
        "video_url" text,
        "attachment_url" text,
        "order_index" integer NOT NULL,
        "parent_topic_id" integer,
        "order_number" integer NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("parent_topic_id") REFERENCES "topics"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 4. Activities
        console.log("Creating activities...");
        await db.run(sql`
      CREATE TABLE "activities" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "course_id" integer,
        "title" text NOT NULL,
        "type" text NOT NULL,
        "description" text NOT NULL,
        "scheduled_date" text NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 5. Course Assignments
        console.log("Creating course_assignments...");
        await db.run(sql`
      CREATE TABLE "course_assignments" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "course_id" integer,
        "user_id" text,
        "progress" integer DEFAULT 0 NOT NULL,
        "status" text DEFAULT 'not_started' NOT NULL,
        "assigned_at" text NOT NULL,
        "completed_at" text,
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 6. Policy Completions
        console.log("Creating policy_completions...");
        await db.run(sql`
      CREATE TABLE "policy_completions" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "policy_id" integer,
        "user_id" text,
        "completed_at" text NOT NULL,
        FOREIGN KEY ("policy_id") REFERENCES "company_policies"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 7. Portfolios
        console.log("Creating portfolios...");
        await db.run(sql`
      CREATE TABLE "portfolios" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "user_id" text NOT NULL,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);
        await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS "portfolios_user_id_unique" ON "portfolios" ("user_id")`);

        // 8. Portfolio Items
        console.log("Creating portfolio_items...");
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

        // 9. Feedback Requests
        console.log("Creating feedback_requests...");
        await db.run(sql`
      CREATE TABLE "feedback_requests" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "requester_id" text,
        "reviewer_id" text,
        "year" integer NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" text NOT NULL,
        FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
        FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 10. Feedback Responses
        console.log("Creating feedback_responses...");
        await db.run(sql`
      CREATE TABLE "feedback_responses" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "request_id" integer,
        "rating" integer NOT NULL,
        "skills_evaluation" text NOT NULL,
        "comments" text NOT NULL,
        "submitted_at" text NOT NULL,
        FOREIGN KEY ("request_id") REFERENCES "feedback_requests"("id") ON UPDATE no action ON DELETE no action
      )
    `);

        // 11. Review Forms
        console.log("Creating review_forms...");
        await db.run(sql`
        CREATE TABLE "review_forms" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "cycle_id" integer,
            "employee_id" text,
            "reviewer_id" text,
            "reviewer_type" text NOT NULL,
            "status" text DEFAULT 'pending' NOT NULL,
            "overall_rating" integer,
            "goals_achievement" text,
            "strengths" text,
            "improvements" text,
            "kpi_scores" text,
            "additional_comments" text,
            "submitted_at" text,
            "created_at" text NOT NULL,
            "updated_at" text NOT NULL,
            FOREIGN KEY ("cycle_id") REFERENCES "review_cycles"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
    `);

        // 12. Reviewer Assignments
        console.log("Creating reviewer_assignments...");
        await db.run(sql`
        CREATE TABLE "reviewer_assignments" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "cycle_id" integer,
            "employee_id" text,
            "reviewer_id" text,
            "reviewer_type" text NOT NULL,
            "assigned_by" text,
            "status" text DEFAULT 'pending' NOT NULL,
            "notified_at" text,
            "created_at" text NOT NULL,
            FOREIGN KEY ("cycle_id") REFERENCES "review_cycles"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
    `);

        // 13. Review Comments
        console.log("Creating review_comments...");
        await db.run(sql`
        CREATE TABLE "review_comments" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "form_id" integer,
            "commenter_id" text,
            "commenter_role" text NOT NULL,
            "comment" text NOT NULL,
            "created_at" text NOT NULL,
            FOREIGN KEY ("form_id") REFERENCES "review_forms"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("commenter_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
    `);

        // 14. Review Notifications
        console.log("Creating review_notifications...");
        await db.run(sql`
        CREATE TABLE "review_notifications" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "user_id" text,
            "notification_type" text NOT NULL,
            "title" text NOT NULL,
            "message" text NOT NULL,
            "related_id" integer,
            "is_read" integer DEFAULT 0 NOT NULL,
            "created_at" text NOT NULL,
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
    `);

        // 15. Appraisals
        console.log("Creating appraisals...");
        await db.run(sql`
        CREATE TABLE "appraisals" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "employee_id" text NOT NULL,
            "cycle_id" integer NOT NULL,
            "review_year" integer NOT NULL,
            "past_ctc" integer NOT NULL,
            "current_ctc" integer NOT NULL,
            "hike_percentage" real NOT NULL,
            "notes" text,
            "updated_by" text NOT NULL,
            "created_at" text NOT NULL,
            "updated_at" text NOT NULL,
            FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("cycle_id") REFERENCES "review_cycles"("id") ON UPDATE no action ON DELETE no action,
            FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
    `);

        // 16. Employee Onboarding
        console.log("Creating employee_onboarding...");
        await db.run(sql`
        CREATE TABLE "employee_onboarding" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "status" text DEFAULT 'pending' NOT NULL,
            "submitted_at" text NOT NULL,
            "reviewed_by" text,
            "reviewed_at" text,
            "full_name" text NOT NULL,
            "date_of_birth" text NOT NULL,
            "gender" text NOT NULL,
            "personal_email" text NOT NULL,
            "personal_phone" text NOT NULL,
            "current_address" text NOT NULL,
            "permanent_address" text,
            "emergency_contact_name" text NOT NULL,
            "emergency_contact_relationship" text NOT NULL,
            "emergency_contact_phone" text NOT NULL,
            "aadhaar_number" text NOT NULL,
            "pan_number" text NOT NULL,
            "aadhaar_upload_url" text,
            "pan_upload_url" text,
            "passport_upload_url" text,
            "photo_upload_url" text NOT NULL,
            "job_title" text NOT NULL,
            "department" text,
            "reporting_manager" text,
            "date_of_joining" text NOT NULL,
            "employment_type" text NOT NULL,
            "work_location" text NOT NULL,
            "highest_qualification" text,
            "degree_certificate_url" text,
            "technical_skills" text,
            "certifications_urls" text,
            "previous_company" text,
            "previous_job_title" text,
            "total_experience" text,
            "experience_letter_url" text,
            "uan_number" text,
            "last_salary_slip_url" text,
            "bank_account_number" text NOT NULL,
            "ifsc_code" text NOT NULL,
            "bank_name_branch" text NOT NULL,
            "cancelled_cheque_url" text NOT NULL,
            "tax_regime" text NOT NULL,
            "investment_proofs_url" text,
            "laptop_required" text NOT NULL,
            "software_access" text,
            "tshirt_size" text,
            "policy_agreements" text NOT NULL,
            "signature" text NOT NULL,
            "blood_group" text,
            "linkedin_profile" text,
            "special_accommodations" text,
            "about_yourself" text,
            "work_preferences" text,
            "career_goals" text,
            "hobbies" text,
            "created_at" text NOT NULL,
            "updated_at" text NOT NULL,
            FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
    `);

        console.log("Schema migration completed successfully. All legacy FKs replaced with 'users'.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

fixAllSchema();
