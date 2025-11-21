"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageLoader } from "@/components/ui/loading-spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  CreditCard,
  Shield,
  Laptop,
  FileText,
  Calendar,
  Clock
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"

interface OnboardingSubmission {
  id: number
  status: "pending" | "in_review" | "approved" | "rejected"
  submittedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  
  // Section 1: Personal Information
  fullName: string
  dateOfBirth: string
  gender: string
  personalEmail: string
  personalPhone: string
  currentAddress: string
  permanentAddress: string | null
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
  
  // Section 2: Identity & Verification
  aadhaarNumber: string
  panNumber: string
  aadhaarUploadUrl: string | null
  panUploadUrl: string | null
  passportUploadUrl: string | null
  photoUploadUrl: string
  
  // Section 3: Employment Details
  jobTitle: string
  department: string | null
  reportingManager: string | null
  dateOfJoining: string
  employmentType: string
  workLocation: string
  
  // Section 4: Educational & Skill Details
  highestQualification: string | null
  degreeCertificateUrl: string | null
  technicalSkills: string | null
  certificationsUrls: string | null
  
  // Section 5: Previous Employment
  previousCompany: string | null
  previousJobTitle: string | null
  totalExperience: string | null
  experienceLetterUrl: string | null
  uanNumber: string | null
  lastSalarySlipUrl: string | null
  
  // Section 6: Bank Details
  bankAccountNumber: string
  ifscCode: string
  bankNameBranch: string
  cancelledChequeUrl: string
  
  // Section 7: Tax Information
  taxRegime: string
  investmentProofsUrl: string | null
  
  // Section 8: IT & System Setup
  laptopRequired: string
  softwareAccess: string | null
  tshirtSize: string | null
  
  // Section 9: Policy Agreements
  policyAgreements: string
  signature: string
  
  // Section 10: Additional Information
  bloodGroup: string | null
  linkedinProfile: string | null
  specialAccommodations: string | null
  aboutYourself: string | null
  workPreferences: string | null
  careerGoals: string | null
  hobbies: string | null
  
  reviewer: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

export default function OnboardingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [submission, setSubmission] = useState<OnboardingSubmission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSubmission()
    }
  }, [params.id])

  const fetchSubmission = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/onboarding/${params.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error("Failed to load submission")
      
      const data = await response.json()
      setSubmission(data)
    } catch (error) {
      toast.error("Failed to load onboarding submission")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: "approved" | "rejected") => {
    if (!submission || !session?.user?.id) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/onboarding/${submission.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reviewerId: session.user.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${newStatus} submission`)
      }

      const updatedSubmission = await response.json()
      setSubmission(updatedSubmission)
      toast.success(`Submission ${newStatus} successfully`)
      setActionDialogOpen(false)
      setActionType(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to update submission status")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const parseJSON = (jsonString: string | null) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <PageLoader text="Loading submission details..." />
      </DashboardLayout>
    )
  }

  if (!submission) {
    return (
      <DashboardLayout userRole="admin">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
          <p className="text-muted-foreground mb-4">The onboarding submission you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/admin/onboarding")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const technicalSkills = parseJSON(submission.technicalSkills)
  const certifications = parseJSON(submission.certificationsUrls)
  const softwareAccess = parseJSON(submission.softwareAccess)
  const policyAgreements = parseJSON(submission.policyAgreements)
  const workPreferences = parseJSON(submission.workPreferences)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500 text-white", icon: Clock },
      in_review: { color: "bg-blue-500 text-white", icon: FileText },
      approved: { color: "bg-green-500 text-white", icon: CheckCircle },
      rejected: { color: "bg-red-500 text-white", icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon

    return (
      <Badge className={config?.color}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/onboarding")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{submission.fullName}</h1>
              <p className="text-muted-foreground">
                Submitted on {formatDateTime(submission.submittedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(submission.status)}
            {submission.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionType("reject")
                    setActionDialogOpen(true)
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setActionType("approve")
                    setActionDialogOpen(true)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Review Status Card */}
        {submission.reviewedBy && submission.reviewer && (
          <Card>
            <CardHeader>
              <CardTitle>Review Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviewed By:</span>
                <span className="font-medium">{submission.reviewer.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviewer Email:</span>
                <span className="font-medium">{submission.reviewer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviewed At:</span>
                <span className="font-medium">{submission.reviewedAt && formatDateTime(submission.reviewedAt)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 1: Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-base">{submission.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
              <p className="text-base">{formatDate(submission.dateOfBirth)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="text-base capitalize">{submission.gender.replace("-", " ")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Personal Email</label>
              <p className="text-base">{submission.personalEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Personal Phone</label>
              <p className="text-base">{submission.personalPhone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
              <p className="text-base">{submission.bloodGroup || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Current Address</label>
              <p className="text-base">{submission.currentAddress}</p>
            </div>
            {submission.permanentAddress && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
                <p className="text-base">{submission.permanentAddress}</p>
              </div>
            )}
            <Separator className="md:col-span-2" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Emergency Contact Name</label>
              <p className="text-base">{submission.emergencyContactName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Relationship</label>
              <p className="text-base">{submission.emergencyContactRelationship}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Emergency Contact Phone</label>
              <p className="text-base">{submission.emergencyContactPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Identity & Verification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Identity & Verification Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Aadhaar Number</label>
              <p className="text-base font-mono">{submission.aadhaarNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
              <p className="text-base font-mono">{submission.panNumber}</p>
            </div>
            {submission.aadhaarUploadUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Aadhaar Upload</label>
                <p className="text-sm text-primary hover:underline">
                  <a href={submission.aadhaarUploadUrl} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </p>
              </div>
            )}
            {submission.panUploadUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">PAN Upload</label>
                <p className="text-sm text-primary hover:underline">
                  <a href={submission.panUploadUrl} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </p>
              </div>
            )}
            {submission.passportUploadUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Passport Upload</label>
                <p className="text-sm text-primary hover:underline">
                  <a href={submission.passportUploadUrl} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Photo</label>
              <p className="text-sm text-primary hover:underline">
                <a href={submission.photoUploadUrl} target="_blank" rel="noopener noreferrer">
                  View Photo
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Employment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Employment Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Job Title</label>
              <p className="text-base">{submission.jobTitle}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-base">{submission.department || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reporting Manager</label>
              <p className="text-base">{submission.reportingManager || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date of Joining</label>
              <p className="text-base">{formatDate(submission.dateOfJoining)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
              <Badge variant="outline" className="capitalize">
                {submission.employmentType.replace("-", " ")}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Work Location</label>
              <p className="text-base">{submission.workLocation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Educational & Skill Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Educational & Skill Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Highest Qualification</label>
                <p className="text-base">{submission.highestQualification || "-"}</p>
              </div>
              {submission.degreeCertificateUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Degree Certificate</label>
                  <p className="text-sm text-primary hover:underline">
                    <a href={submission.degreeCertificateUrl} target="_blank" rel="noopener noreferrer">
                      View Certificate
                    </a>
                  </p>
                </div>
              )}
            </div>
            {technicalSkills && Array.isArray(technicalSkills) && technicalSkills.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Technical Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {technicalSkills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            {certifications && Array.isArray(certifications) && certifications.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Certifications</label>
                <div className="space-y-1 mt-2">
                  {certifications.map((cert: string, index: number) => (
                    <p key={index} className="text-sm text-primary hover:underline">
                      <a href={cert} target="_blank" rel="noopener noreferrer">
                        Certification {index + 1}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Previous Employment */}
        {(submission.previousCompany || submission.previousJobTitle || submission.totalExperience) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle>Previous Employment Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {submission.previousCompany && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Previous Company</label>
                  <p className="text-base">{submission.previousCompany}</p>
                </div>
              )}
              {submission.previousJobTitle && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Previous Job Title</label>
                  <p className="text-base">{submission.previousJobTitle}</p>
                </div>
              )}
              {submission.totalExperience && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Experience</label>
                  <p className="text-base">{submission.totalExperience}</p>
                </div>
              )}
              {submission.uanNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">UAN Number</label>
                  <p className="text-base font-mono">{submission.uanNumber}</p>
                </div>
              )}
              {submission.experienceLetterUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Experience Letter</label>
                  <p className="text-sm text-primary hover:underline">
                    <a href={submission.experienceLetterUrl} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </p>
                </div>
              )}
              {submission.lastSalarySlipUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Salary Slip</label>
                  <p className="text-sm text-primary hover:underline">
                    <a href={submission.lastSalarySlipUrl} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section 6: Bank Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Bank Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bank Account Number</label>
              <p className="text-base font-mono">{submission.bankAccountNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
              <p className="text-base font-mono">{submission.ifscCode}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Bank Name & Branch</label>
              <p className="text-base">{submission.bankNameBranch}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cancelled Cheque / Passbook</label>
              <p className="text-sm text-primary hover:underline">
                <a href={submission.cancelledChequeUrl} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Tax Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Tax Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tax Regime</label>
              <Badge variant="outline" className="capitalize">
                {submission.taxRegime.replace("-", " ")}
              </Badge>
            </div>
            {submission.investmentProofsUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Investment Proofs</label>
                <p className="text-sm text-primary hover:underline">
                  <a href={submission.investmentProofsUrl} target="_blank" rel="noopener noreferrer">
                    View Documents
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 8: IT & System Setup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              <CardTitle>IT & System Setup Requirements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Laptop Required</label>
                <Badge variant={submission.laptopRequired === "yes" ? "default" : "secondary"}>
                  {submission.laptopRequired.toUpperCase()}
                </Badge>
              </div>
              {submission.tshirtSize && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">T-shirt Size</label>
                  <p className="text-base">{submission.tshirtSize.toUpperCase()}</p>
                </div>
              )}
            </div>
            {softwareAccess && Array.isArray(softwareAccess) && softwareAccess.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Software Access Required</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {softwareAccess.map((software: string, index: number) => (
                    <Badge key={index} variant="outline">{software}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 9: Policy Agreements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Policy Agreements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {policyAgreements && Array.isArray(policyAgreements) && policyAgreements.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agreed Policies</label>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {policyAgreements.map((policy: string, index: number) => (
                    <li key={index} className="text-sm">{policy}</li>
                  ))}
                </ul>
              </div>
            )}
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Digital Signature</label>
              <p className="text-base font-signature italic">{submission.signature}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 10: Additional Information */}
        {(submission.linkedinProfile || submission.specialAccommodations || submission.aboutYourself || submission.careerGoals || submission.hobbies) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.linkedinProfile && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">LinkedIn Profile</label>
                  <p className="text-sm text-primary hover:underline">
                    <a href={submission.linkedinProfile} target="_blank" rel="noopener noreferrer">
                      {submission.linkedinProfile}
                    </a>
                  </p>
                </div>
              )}
              {submission.aboutYourself && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">About Yourself</label>
                  <p className="text-base whitespace-pre-wrap">{submission.aboutYourself}</p>
                </div>
              )}
              {submission.careerGoals && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Career Goals</label>
                  <p className="text-base whitespace-pre-wrap">{submission.careerGoals}</p>
                </div>
              )}
              {submission.hobbies && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hobbies & Interests</label>
                  <p className="text-base whitespace-pre-wrap">{submission.hobbies}</p>
                </div>
              )}
              {submission.specialAccommodations && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Special Accommodations</label>
                  <p className="text-base whitespace-pre-wrap">{submission.specialAccommodations}</p>
                </div>
              )}
              {workPreferences && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Work Preferences</label>
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                    {JSON.stringify(workPreferences, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Confirmation Dialog */}
        <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "approve" ? "Approve Submission" : "Reject Submission"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionType === "approve"
                  ? `Are you sure you want to approve the onboarding submission for ${submission.fullName}? This action will mark the submission as approved.`
                  : `Are you sure you want to reject the onboarding submission for ${submission.fullName}? The candidate will be notified of the rejection.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => actionType && handleStatusUpdate(actionType)}
                disabled={isProcessing}
                className={actionType === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              >
                {isProcessing ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
