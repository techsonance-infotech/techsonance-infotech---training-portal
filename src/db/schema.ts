import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(), // 'admin', 'employee', 'intern'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Courses table
export const courses = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Topics table
export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').references(() => courses.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  videoUrl: text('video_url'),
  attachmentUrl: text('attachment_url'),
  orderIndex: integer('order_index').notNull(),
  createdAt: text('created_at').notNull(),
});

// Activities table
export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').references(() => courses.id),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'overview', 'discussion', 'practical', 'review', etc.
  description: text('description').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// Course assignments table
export const courseAssignments = sqliteTable('course_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').references(() => courses.id),
  userId: integer('user_id').references(() => users.id),
  progress: integer('progress').notNull().default(0), // 0-100
  status: text('status').notNull().default('not_started'), // 'not_started', 'in_progress', 'completed'
  assignedAt: text('assigned_at').notNull(),
  completedAt: text('completed_at'),
});

// Company policies table
export const companyPolicies = sqliteTable('company_policies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  documentUrl: text('document_url'),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Policy completions table
export const policyCompletions = sqliteTable('policy_completions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  policyId: integer('policy_id').references(() => companyPolicies.id),
  userId: integer('user_id').references(() => users.id),
  completedAt: text('completed_at').notNull(),
});

// Portfolios table
export const portfolios = sqliteTable('portfolios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Portfolio items table
export const portfolioItems = sqliteTable('portfolio_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  portfolioId: integer('portfolio_id').references(() => portfolios.id),
  category: text('category').notNull(), // 'qualification', 'certification', 'skill', 'industry_knowledge', 'personal_quality'
  title: text('title').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});

// Feedback requests table
export const feedbackRequests = sqliteTable('feedback_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requesterId: integer('requester_id').references(() => users.id),
  reviewerId: integer('reviewer_id').references(() => users.id),
  year: integer('year').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'completed'
  createdAt: text('created_at').notNull(),
});

// Feedback responses table
export const feedbackResponses = sqliteTable('feedback_responses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestId: integer('request_id').references(() => feedbackRequests.id),
  rating: integer('rating').notNull(), // 1-5
  skillsEvaluation: text('skills_evaluation').notNull(),
  comments: text('comments').notNull(),
  submittedAt: text('submitted_at').notNull(),
});


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("employee"), // 'admin', 'employee', 'intern'
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});