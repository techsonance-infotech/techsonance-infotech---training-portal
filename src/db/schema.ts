import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

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

// Topics table with hierarchical support
export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  courseId: integer('course_id').references(() => courses.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  videoUrl: text('video_url'),
  attachmentUrl: text('attachment_url'),
  orderIndex: integer('order_index').notNull(),
  parentTopicId: integer('parent_topic_id').references(() => topics.id),
  orderNumber: integer('order_number').notNull(),
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

// Review cycles table
export const reviewCycles = sqliteTable('review_cycles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  cycleType: text('cycle_type').notNull(), // "6-month" or "1-year"
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('draft'), // "draft", "active", "locked", "completed"
  createdBy: text('created_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Review forms table
export const reviewForms = sqliteTable('review_forms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: integer('cycle_id').references(() => reviewCycles.id),
  employeeId: text('employee_id').references(() => user.id),
  reviewerId: text('reviewer_id').references(() => user.id),
  reviewerType: text('reviewer_type').notNull(), // "self", "peer", "client", "manager"
  status: text('status').notNull().default('pending'), // "pending", "draft", "submitted", "approved"
  overallRating: integer('overall_rating'),
  goalsAchievement: text('goals_achievement'),
  strengths: text('strengths'),
  improvements: text('improvements'),
  kpiScores: text('kpi_scores', { mode: 'json' }),
  additionalComments: text('additional_comments'),
  submittedAt: text('submitted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Reviewer assignments table
export const reviewerAssignments = sqliteTable('reviewer_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: integer('cycle_id').references(() => reviewCycles.id),
  employeeId: text('employee_id').references(() => user.id),
  reviewerId: text('reviewer_id').references(() => user.id),
  reviewerType: text('reviewer_type').notNull(), // "self", "peer", "client", "manager"
  assignedBy: text('assigned_by').references(() => user.id),
  status: text('status').notNull().default('pending'), // "pending", "completed", "overdue"
  notifiedAt: text('notified_at'),
  createdAt: text('created_at').notNull(),
});

// Review comments table
export const reviewComments = sqliteTable('review_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formId: integer('form_id').references(() => reviewForms.id),
  commenterId: text('commenter_id').references(() => user.id),
  commenterRole: text('commenter_role').notNull(), // "admin", "hr", "manager"
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(),
});

// Review notifications table
export const reviewNotifications = sqliteTable('review_notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id),
  notificationType: text('notification_type').notNull(), // "review_requested", "review_submitted", "draft_saved", "cycle_completed", "reminder"
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedId: integer('related_id'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

// Appraisals table
export const appraisals = sqliteTable('appraisals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: text('employee_id').notNull().references(() => user.id),
  cycleId: integer('cycle_id').notNull().references(() => reviewCycles.id),
  reviewYear: integer('review_year').notNull(),
  pastCtc: integer('past_ctc').notNull(),
  currentCtc: integer('current_ctc').notNull(),
  hikePercentage: real('hike_percentage').notNull(),
  notes: text('notes'),
  updatedBy: text('updated_by').notNull().references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
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

// Add employee onboarding table at the end
export const employeeOnboarding = sqliteTable('employee_onboarding', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  
  // Core fields
  status: text('status').notNull().default('pending'), // 'pending', 'in_review', 'approved', 'rejected'
  submittedAt: text('submitted_at').notNull(),
  reviewedBy: text('reviewed_by').references(() => user.id),
  reviewedAt: text('reviewed_at'),
  
  // Section 1: Personal Information
  fullName: text('full_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  personalEmail: text('personal_email').notNull(),
  personalPhone: text('personal_phone').notNull(),
  currentAddress: text('current_address').notNull(),
  permanentAddress: text('permanent_address'),
  emergencyContactName: text('emergency_contact_name').notNull(),
  emergencyContactRelationship: text('emergency_contact_relationship').notNull(),
  emergencyContactPhone: text('emergency_contact_phone').notNull(),
  
  // Section 2: Identity & Verification
  aadhaarNumber: text('aadhaar_number').notNull(),
  panNumber: text('pan_number').notNull(),
  aadhaarUploadUrl: text('aadhaar_upload_url'),
  panUploadUrl: text('pan_upload_url'),
  passportUploadUrl: text('passport_upload_url'),
  photoUploadUrl: text('photo_upload_url').notNull(),
  
  // Section 3: Employment Details
  jobTitle: text('job_title').notNull(),
  department: text('department'),
  reportingManager: text('reporting_manager'),
  dateOfJoining: text('date_of_joining').notNull(),
  employmentType: text('employment_type').notNull(),
  workLocation: text('work_location').notNull(),
  
  // Section 4: Educational & Skill Details
  highestQualification: text('highest_qualification'),
  degreeCertificateUrl: text('degree_certificate_url'),
  technicalSkills: text('technical_skills', { mode: 'json' }),
  certificationsUrls: text('certifications_urls', { mode: 'json' }),
  
  // Section 5: Previous Employment
  previousCompany: text('previous_company'),
  previousJobTitle: text('previous_job_title'),
  totalExperience: text('total_experience'),
  experienceLetterUrl: text('experience_letter_url'),
  uanNumber: text('uan_number'),
  lastSalarySlipUrl: text('last_salary_slip_url'),
  
  // Section 6: Bank Details
  bankAccountNumber: text('bank_account_number').notNull(),
  ifscCode: text('ifsc_code').notNull(),
  bankNameBranch: text('bank_name_branch').notNull(),
  cancelledChequeUrl: text('cancelled_cheque_url').notNull(),
  
  // Section 7: Tax Information
  taxRegime: text('tax_regime').notNull(),
  investmentProofsUrl: text('investment_proofs_url'),
  
  // Section 8: IT & System Setup
  laptopRequired: text('laptop_required').notNull(),
  softwareAccess: text('software_access', { mode: 'json' }),
  tshirtSize: text('tshirt_size'),
  
  // Section 9: Policy Agreements
  policyAgreements: text('policy_agreements', { mode: 'json' }).notNull(),
  signature: text('signature').notNull(),
  
  // Section 10: Additional Information
  bloodGroup: text('blood_group'),
  linkedinProfile: text('linkedin_profile'),
  specialAccommodations: text('special_accommodations'),
  aboutYourself: text('about_yourself'),
  workPreferences: text('work_preferences', { mode: 'json' }),
  careerGoals: text('career_goals'),
  hobbies: text('hobbies'),
  
  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});