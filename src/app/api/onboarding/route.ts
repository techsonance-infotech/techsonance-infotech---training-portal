import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employeeOnboarding, users } from '@/db/schema';
import { eq, like, or, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const submission = await db
        .select()
        .from(employeeOnboarding)
        .where(eq(employeeOnboarding.id, parseInt(id)))
        .limit(1);

      if (submission.length === 0) {
        return NextResponse.json(
          { error: 'Onboarding submission not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      // Get reviewer details if reviewedBy exists
      let reviewerDetails = null;
      if (submission[0].reviewedBy) {
        const reviewer = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
          .from(user)
          .where(eq(user.id, submission[0].reviewedBy))
          .limit(1);

        if (reviewer.length > 0) {
          reviewerDetails = reviewer[0];
        }
      }

      return NextResponse.json({
        ...submission[0],
        reviewer: reviewerDetails,
      }, { status: 200 });
    }

    // List with pagination, search, filtering, and sorting
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = db
      .select()
      .from(employeeOnboarding);

    // Build WHERE conditions
    const conditions = [];

    // Status filter
    if (status) {
      const validStatuses = ['pending', 'in_review', 'approved', 'rejected'];
      if (validStatuses.includes(status)) {
        conditions.push(eq(employeeOnboarding.status, status));
      }
    }

    // Search functionality
    if (search) {
      conditions.push(
        or(
          like(employeeOnboarding.fullName, `%${search}%`),
          like(employeeOnboarding.personalEmail, `%${search}%`),
          like(employeeOnboarding.jobTitle, `%${search}%`),
          like(employeeOnboarding.department, `%${search}%`)
        )
      );
    }

    // Date range filter
    if (from) {
      conditions.push(gte(employeeOnboarding.submittedAt, from));
    }
    if (to) {
      conditions.push(lte(employeeOnboarding.submittedAt, to));
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sort by submittedAt descending
    const results = await query
      .orderBy(desc(employeeOnboarding.submittedAt))
      .limit(limit)
      .offset(offset);

    // Enrich with reviewer details
    const enrichedResults = await Promise.all(
      results.map(async (submission) => {
        let reviewerDetails = null;
        if (submission.reviewedBy) {
          const reviewer = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            })
            .from(user)
            .where(eq(user.id, submission.reviewedBy))
            .limit(1);

          if (reviewer.length > 0) {
            reviewerDetails = reviewer[0];
          }
        }

        return {
          ...submission,
          reviewer: reviewerDetails,
        };
      })
    );

    return NextResponse.json(enrichedResults, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields based on actual schema
    const requiredFields = [
      'fullName',
      'dateOfBirth',
      'gender',
      'personalEmail',
      'personalPhone',
      'currentAddress',
      'emergencyContactName',
      'emergencyContactRelationship',
      'emergencyContactPhone',
      'aadhaarNumber',
      'aadhaarNumber',
      'photoUploadUrl',
      'jobTitle',
      'dateOfJoining',
      'employmentType',
      'workLocation',
      'bankAccountNumber',
      'ifscCode',
      'bankNameBranch',
      'cancelledChequeUrl',
      'taxRegime',
      'laptopRequired',
      'policyAgreements',
      'signature',
    ];

    const missingFields = requiredFields.filter((field) => !body[field] || (typeof body[field] === 'string' && body[field].trim() === ''));
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
          code: 'MISSING_REQUIRED_FIELDS',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.personalEmail)) {
      console.log("Validation failed: Invalid email", body.personalEmail);
      return NextResponse.json(
        {
          error: 'Invalid email format for personalEmail',
          code: 'INVALID_EMAIL_FORMAT',
        },
        { status: 400 }
      );
    }

    // Validate laptopRequired
    if (!['yes', 'no'].includes(body.laptopRequired)) {
      console.log("Validation failed: laptopRequired", body.laptopRequired);
      return NextResponse.json(
        {
          error: 'laptopRequired must be either "yes" or "no"',
          code: 'INVALID_LAPTOP_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log("Onboarding POST body:", JSON.stringify(body, null, 2));

    // Allow empty strings for optional fields by setting them to null if empty
    const optionalFields = ['department', 'reportingManager', 'degreeCertificateUrl', 'previousCompany', 'previousJobTitle', 'totalExperience', 'experienceLetterUrl', 'uanNumber', 'lastSalarySlipUrl', 'investmentProofsUrl', 'tshirtSize', 'bloodGroup', 'linkedinProfile', 'specialAccommodations', 'aboutYourself', 'careerGoals', 'hobbies', 'aadhaarUploadUrl', 'panUploadUrl', 'passportUploadUrl', 'permananetAddress'];

    for (const field of optionalFields) {
      if (body[field] === "") {
        body[field] = null;
      }
    }

    // Validate employment type
    const validEmploymentTypes = ['full-time', 'part-time', 'contract', 'intern'];
    if (!validEmploymentTypes.includes(body.employmentType)) {
      return NextResponse.json(
        {
          error: `employmentType must be one of: ${validEmploymentTypes.join(', ')}`,
          code: 'INVALID_EMPLOYMENT_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
    if (!validGenders.includes(body.gender)) {
      return NextResponse.json(
        {
          error: `gender must be one of: ${validGenders.join(', ')}`,
          code: 'INVALID_GENDER',
        },
        { status: 400 }
      );
    }

    // Validate policyAgreements is array (or JSON string that parses to array)
    let parsedPolicyAgreements = body.policyAgreements;
    if (typeof body.policyAgreements === 'string') {
      try {
        parsedPolicyAgreements = JSON.parse(body.policyAgreements);
      } catch (e) {
        // failed to parse, keep as is to fail array check
      }
    }

    if (!Array.isArray(parsedPolicyAgreements)) {
      return NextResponse.json(
        {
          error: 'policyAgreements must be an array',
          code: 'INVALID_POLICY_AGREEMENTS',
        },
        { status: 400 }
      );
    }

    // Check for duplicate aadhaarNumber
    const existingAadhaar = await db
      .select()
      .from(employeeOnboarding)
      .where(eq(employeeOnboarding.aadhaarNumber, body.aadhaarNumber))
      .limit(1);

    if (existingAadhaar.length > 0) {
      return NextResponse.json(
        {
          error: 'Submission with this Aadhaar number already exists',
          code: 'DUPLICATE_AADHAAR',
        },
        { status: 409 }
      );
    }

    if (body.panNumber) {
      // Check for duplicate panNumber
      const existingPan = await db
        .select()
        .from(employeeOnboarding)
        .where(eq(employeeOnboarding.panNumber, body.panNumber))
        .limit(1);

      if (existingPan.length > 0) {
        return NextResponse.json(
          {
            error: 'Submission with this PAN number already exists',
            code: 'DUPLICATE_PAN',
          },
          { status: 409 }
        );
      }
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData: any = {
      // Core fields
      status: 'pending',
      submittedAt: now,
      reviewedBy: null,
      reviewedAt: null,

      // Section 1: Personal Information
      fullName: body.fullName.trim(),
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      personalEmail: body.personalEmail.toLowerCase().trim(),
      personalPhone: body.personalPhone.trim(),
      currentAddress: body.currentAddress.trim(),
      permanentAddress: body.permanentAddress?.trim() || null,
      emergencyContactName: body.emergencyContactName.trim(),
      emergencyContactRelationship: body.emergencyContactRelationship.trim(),
      emergencyContactPhone: body.emergencyContactPhone.trim(),

      // Section 2: Identity & Verification
      aadhaarNumber: body.aadhaarNumber.trim(),
      panNumber: body.panNumber?.trim() || 'N/A',
      aadhaarUploadUrl: body.aadhaarUploadUrl?.trim() || null,
      panUploadUrl: body.panUploadUrl?.trim() || null,
      passportUploadUrl: body.passportUploadUrl?.trim() || null,
      photoUploadUrl: body.photoUploadUrl.trim(),

      // Section 3: Employment Details
      jobTitle: body.jobTitle.trim(),
      department: body.department?.trim() || null,
      reportingManager: body.reportingManager?.trim() || null,
      dateOfJoining: body.dateOfJoining,
      employmentType: body.employmentType,
      workLocation: body.workLocation.trim(),

      // Section 4: Educational & Skill Details
      highestQualification: body.highestQualification?.trim() || null,
      degreeCertificateUrl: body.degreeCertificateUrl?.trim() || null,
      technicalSkills: body.technicalSkills ? JSON.stringify(body.technicalSkills) : null,
      certificationsUrls: body.certificationsUrls ? JSON.stringify(body.certificationsUrls) : null,

      // Section 5: Previous Employment
      previousCompany: body.previousCompany?.trim() || null,
      previousJobTitle: body.previousJobTitle?.trim() || null,
      totalExperience: body.totalExperience?.trim() || null,
      experienceLetterUrl: body.experienceLetterUrl?.trim() || null,
      uanNumber: body.uanNumber?.trim() || null,
      lastSalarySlipUrl: body.lastSalarySlipUrl?.trim() || null,

      // Section 6: Bank Details
      bankAccountNumber: body.bankAccountNumber.trim(),
      ifscCode: body.ifscCode.trim(),
      bankNameBranch: body.bankNameBranch.trim(),
      cancelledChequeUrl: body.cancelledChequeUrl.trim(),

      // Section 7: Tax Information
      taxRegime: body.taxRegime.trim(),
      investmentProofsUrl: body.investmentProofsUrl?.trim() || null,

      // Section 8: IT & System Setup
      laptopRequired: body.laptopRequired,
      softwareAccess: body.softwareAccess ? JSON.stringify(body.softwareAccess) : null,
      tshirtSize: body.tshirtSize?.trim() || null,

      // Section 9: Policy Agreements
      policyAgreements: JSON.stringify(parsedPolicyAgreements),
      signature: body.signature.trim(),

      // Section 10: Additional Information
      bloodGroup: body.bloodGroup?.trim() || null,
      linkedinProfile: body.linkedinProfile?.trim() || null,
      specialAccommodations: body.specialAccommodations?.trim() || null,
      aboutYourself: body.aboutYourself?.trim() || null,
      workPreferences: body.workPreferences ? JSON.stringify(body.workPreferences) : null,
      careerGoals: body.careerGoals?.trim() || null,
      hobbies: body.hobbies?.trim() || null,

      // Timestamps
      createdAt: now,
      updatedAt: now,
    };

    const newSubmission = await db
      .insert(employeeOnboarding)
      .values(insertData)
      .returning();

    return NextResponse.json(newSubmission[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}