"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, User, Shield, Briefcase, GraduationCap, CreditCard, FileText, Laptop } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { PageLoader } from "@/components/ui/loading-spinner"

export default function EditOnboardingPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Section 1: Personal Information
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [personalEmail, setPersonalEmail] = useState("")
  const [personalPhone, setPersonalPhone] = useState("")
  const [currentAddress, setCurrentAddress] = useState("")
  const [permanentAddress, setPermanentAddress] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  
  // Section 2: Identity & Verification
  const [aadhaarNumber, setAadhaarNumber] = useState("")
  const [panNumber, setPanNumber] = useState("")
  const [aadhaarUploadUrl, setAadhaarUploadUrl] = useState("")
  const [panUploadUrl, setPanUploadUrl] = useState("")
  const [passportUploadUrl, setPassportUploadUrl] = useState("")
  const [photoUploadUrl, setPhotoUploadUrl] = useState("")
  
  // Section 3: Employment Details
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [reportingManager, setReportingManager] = useState("")
  const [dateOfJoining, setDateOfJoining] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [workLocation, setWorkLocation] = useState("")
  
  // Section 4: Educational & Skill Details
  const [highestQualification, setHighestQualification] = useState("")
  const [degreeCertificateUrl, setDegreeCertificateUrl] = useState("")
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([])
  const [certificationsUrls, setCertificationsUrls] = useState<string[]>([])
  const [certificationInput, setCertificationInput] = useState("")
  
  // Section 5: Previous Employment
  const [previousCompany, setPreviousCompany] = useState("")
  const [previousJobTitle, setPreviousJobTitle] = useState("")
  const [totalExperience, setTotalExperience] = useState("")
  const [experienceLetterUrl, setExperienceLetterUrl] = useState("")
  const [uanNumber, setUanNumber] = useState("")
  const [lastSalarySlipUrl, setLastSalarySlipUrl] = useState("")
  
  // Section 6: Bank Details
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [ifscCode, setIfscCode] = useState("")
  const [bankNameBranch, setBankNameBranch] = useState("")
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState("")
  
  // Section 7: Tax Information
  const [taxRegime, setTaxRegime] = useState("")
  const [investmentProofsUrl, setInvestmentProofsUrl] = useState("")
  
  // Section 8: IT & System Setup
  const [laptopRequired, setLaptopRequired] = useState("")
  const [softwareAccess, setSoftwareAccess] = useState<string[]>([])
  const [tshirtSize, setTshirtSize] = useState("")
  
  // Section 9: Policy Agreements
  const [policyAgreements, setPolicyAgreements] = useState<string[]>([])
  const [signature, setSignature] = useState("")
  
  // Section 10: Additional Information
  const [bloodGroup, setBloodGroup] = useState("")
  const [linkedinProfile, setLinkedinProfile] = useState("")
  const [specialAccommodations, setSpecialAccommodations] = useState("")
  const [aboutYourself, setAboutYourself] = useState("")
  const [workPreferences, setWorkPreferences] = useState("")
  const [careerGoals, setCareerGoals] = useState("")
  const [hobbies, setHobbies] = useState("")

  const technicalSkillsOptions = [
    "Java", "Python", "JavaScript", "SQL", "Cloud (AWS, Azure, GCP)",
    "UI/UX", "DevOps", "React", "Node.js", "Angular", ".NET"
  ]

  const softwareAccessOptions = [
    "Email (Official ID)", "VPN Access", "GitHub / GitLab", "Jira / ClickUp",
    "AWS / Azure / GCP", "ERP / HRMS", "Slack / Teams"
  ]

  const policyOptions = [
    "Offer Letter", "NDA (Non-Disclosure Agreement)", "Confidentiality Agreement",
    "Code of Conduct", "IT & Data Security Policy", "POSH Policy", "Leave Policy"
  ]

  useEffect(() => {
    if (params.id) {
      fetchSubmission()
    }
  }, [params.id])

  const parseJSON = (jsonString: string | null) => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

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
      
      // Populate form fields
      setFullName(data.fullName || "")
      setDateOfBirth(data.dateOfBirth?.split('T')[0] || "")
      setGender(data.gender || "")
      setPersonalEmail(data.personalEmail || "")
      setPersonalPhone(data.personalPhone || "")
      setCurrentAddress(data.currentAddress || "")
      setPermanentAddress(data.permanentAddress || "")
      setEmergencyContactName(data.emergencyContactName || "")
      setEmergencyContactRelationship(data.emergencyContactRelationship || "")
      setEmergencyContactPhone(data.emergencyContactPhone || "")
      
      setAadhaarNumber(data.aadhaarNumber || "")
      setPanNumber(data.panNumber || "")
      setAadhaarUploadUrl(data.aadhaarUploadUrl || "")
      setPanUploadUrl(data.panUploadUrl || "")
      setPassportUploadUrl(data.passportUploadUrl || "")
      setPhotoUploadUrl(data.photoUploadUrl || "")
      
      setJobTitle(data.jobTitle || "")
      setDepartment(data.department || "")
      setReportingManager(data.reportingManager || "")
      setDateOfJoining(data.dateOfJoining?.split('T')[0] || "")
      setEmploymentType(data.employmentType || "")
      setWorkLocation(data.workLocation || "")
      
      setHighestQualification(data.highestQualification || "")
      setDegreeCertificateUrl(data.degreeCertificateUrl || "")
      
      const skills = parseJSON(data.technicalSkills)
      setTechnicalSkills(Array.isArray(skills) ? skills : [])
      
      const certs = parseJSON(data.certificationsUrls)
      setCertificationsUrls(Array.isArray(certs) ? certs : [])
      
      setPreviousCompany(data.previousCompany || "")
      setPreviousJobTitle(data.previousJobTitle || "")
      setTotalExperience(data.totalExperience || "")
      setExperienceLetterUrl(data.experienceLetterUrl || "")
      setUanNumber(data.uanNumber || "")
      setLastSalarySlipUrl(data.lastSalarySlipUrl || "")
      
      setBankAccountNumber(data.bankAccountNumber || "")
      setIfscCode(data.ifscCode || "")
      setBankNameBranch(data.bankNameBranch || "")
      setCancelledChequeUrl(data.cancelledChequeUrl || "")
      
      setTaxRegime(data.taxRegime || "")
      setInvestmentProofsUrl(data.investmentProofsUrl || "")
      
      setLaptopRequired(data.laptopRequired || "")
      
      const software = parseJSON(data.softwareAccess)
      setSoftwareAccess(Array.isArray(software) ? software : [])
      
      setTshirtSize(data.tshirtSize || "")
      
      const policies = parseJSON(data.policyAgreements)
      setPolicyAgreements(Array.isArray(policies) ? policies : [])
      
      setSignature(data.signature || "")
      
      setBloodGroup(data.bloodGroup || "")
      setLinkedinProfile(data.linkedinProfile || "")
      setSpecialAccommodations(data.specialAccommodations || "")
      setAboutYourself(data.aboutYourself || "")
      setWorkPreferences(data.workPreferences || "")
      setCareerGoals(data.careerGoals || "")
      setHobbies(data.hobbies || "")
      
    } catch (error) {
      toast.error("Failed to load onboarding submission")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTechnicalSkillToggle = (skill: string) => {
    setTechnicalSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleSoftwareAccessToggle = (software: string) => {
    setSoftwareAccess(prev =>
      prev.includes(software)
        ? prev.filter(s => s !== software)
        : [...prev, software]
    )
  }

  const handlePolicyToggle = (policy: string) => {
    setPolicyAgreements(prev =>
      prev.includes(policy)
        ? prev.filter(p => p !== policy)
        : [...prev, policy]
    )
  }

  const addCertification = () => {
    if (certificationInput.trim()) {
      setCertificationsUrls([...certificationsUrls, certificationInput.trim()])
      setCertificationInput("")
    }
  }

  const removeCertification = (index: number) => {
    setCertificationsUrls(certificationsUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!fullName || !dateOfBirth || !gender || !personalEmail || !personalPhone || !currentAddress ||
        !emergencyContactName || !emergencyContactRelationship || !emergencyContactPhone ||
        !aadhaarNumber || !panNumber || !photoUploadUrl ||
        !jobTitle || !dateOfJoining || !employmentType || !workLocation ||
        !bankAccountNumber || !ifscCode || !bankNameBranch || !cancelledChequeUrl ||
        !taxRegime || !laptopRequired || policyAgreements.length === 0 || !signature) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem("bearer_token")
      const payload = {
        fullName,
        dateOfBirth,
        gender,
        personalEmail,
        personalPhone,
        currentAddress,
        permanentAddress: permanentAddress || null,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
        aadhaarNumber,
        panNumber,
        aadhaarUploadUrl: aadhaarUploadUrl || null,
        panUploadUrl: panUploadUrl || null,
        passportUploadUrl: passportUploadUrl || null,
        photoUploadUrl,
        jobTitle,
        department: department || null,
        reportingManager: reportingManager || null,
        dateOfJoining,
        employmentType,
        workLocation,
        highestQualification: highestQualification || null,
        degreeCertificateUrl: degreeCertificateUrl || null,
        technicalSkills: technicalSkills.length > 0 ? JSON.stringify(technicalSkills) : null,
        certificationsUrls: certificationsUrls.length > 0 ? JSON.stringify(certificationsUrls) : null,
        previousCompany: previousCompany || null,
        previousJobTitle: previousJobTitle || null,
        totalExperience: totalExperience || null,
        experienceLetterUrl: experienceLetterUrl || null,
        uanNumber: uanNumber || null,
        lastSalarySlipUrl: lastSalarySlipUrl || null,
        bankAccountNumber,
        ifscCode,
        bankNameBranch,
        cancelledChequeUrl,
        taxRegime,
        investmentProofsUrl: investmentProofsUrl || null,
        laptopRequired,
        softwareAccess: softwareAccess.length > 0 ? JSON.stringify(softwareAccess) : null,
        tshirtSize: tshirtSize || null,
        policyAgreements: JSON.stringify(policyAgreements),
        signature,
        bloodGroup: bloodGroup || null,
        linkedinProfile: linkedinProfile || null,
        specialAccommodations: specialAccommodations || null,
        aboutYourself: aboutYourself || null,
        workPreferences: workPreferences || null,
        careerGoals: careerGoals || null,
        hobbies: hobbies || null
      }

      const response = await fetch(`/api/onboarding/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update onboarding submission")
      }

      toast.success("Onboarding submission updated successfully!")
      router.push(`/admin/onboarding/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update submission")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <PageLoader text="Loading submission..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.push(`/admin/onboarding/${params.id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Employee Onboarding</h1>
              <p className="text-muted-foreground">Update employee information</p>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Section 1: Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Section 1: Personal Information</CardTitle>
            </div>
            <CardDescription>Basic personal details and emergency contact information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
              <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="personalEmail">Personal Email <span className="text-destructive">*</span></Label>
              <Input id="personalEmail" type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="personalPhone">Personal Phone <span className="text-destructive">*</span></Label>
              <Input id="personalPhone" type="tel" value={personalPhone} onChange={(e) => setPersonalPhone(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input id="bloodGroup" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g., A+, B-, O+" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="currentAddress">Current Residential Address <span className="text-destructive">*</span></Label>
              <Textarea id="currentAddress" value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea id="permanentAddress" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} placeholder="Leave blank if same as current address" />
            </div>
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name <span className="text-destructive">*</span></Label>
              <Input id="emergencyContactName" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="emergencyContactRelationship">Relationship <span className="text-destructive">*</span></Label>
              <Input id="emergencyContactRelationship" value={emergencyContactRelationship} onChange={(e) => setEmergencyContactRelationship(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone <span className="text-destructive">*</span></Label>
              <Input id="emergencyContactPhone" type="tel" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Identity & Verification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Section 2: Identity & Verification Documents</CardTitle>
            </div>
            <CardDescription>Upload identity documents and passport-size photo</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="aadhaarNumber">Aadhaar Number <span className="text-destructive">*</span></Label>
              <Input id="aadhaarNumber" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} required placeholder="XXXX-XXXX-XXXX" />
            </div>
            <div>
              <Label htmlFor="panNumber">PAN Number <span className="text-destructive">*</span></Label>
              <Input id="panNumber" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} required placeholder="ABCDE1234F" />
            </div>
            <div>
              <Label htmlFor="aadhaarUploadUrl">Aadhaar Card Upload URL</Label>
              <Input id="aadhaarUploadUrl" type="url" value={aadhaarUploadUrl} onChange={(e) => setAadhaarUploadUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="panUploadUrl">PAN Card Upload URL</Label>
              <Input id="panUploadUrl" type="url" value={panUploadUrl} onChange={(e) => setPanUploadUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="passportUploadUrl">Passport Upload URL (if available)</Label>
              <Input id="passportUploadUrl" type="url" value={passportUploadUrl} onChange={(e) => setPassportUploadUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="photoUploadUrl">Passport-size Photo URL <span className="text-destructive">*</span></Label>
              <Input id="photoUploadUrl" type="url" value={photoUploadUrl} onChange={(e) => setPhotoUploadUrl(e.target.value)} required placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Employment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Section 3: Employment Details</CardTitle>
            </div>
            <CardDescription>Job title, department, and work arrangements</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="jobTitle">Job Title / Designation <span className="text-destructive">*</span></Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="department">Department / Team</Label>
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="reportingManager">Reporting Manager Name</Label>
              <Input id="reportingManager" value={reportingManager} onChange={(e) => setReportingManager(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dateOfJoining">Date of Joining <span className="text-destructive">*</span></Label>
              <Input id="dateOfJoining" type="date" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="employmentType">Employment Type <span className="text-destructive">*</span></Label>
              <Select value={employmentType} onValueChange={setEmploymentType} required>
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workLocation">Work Location <span className="text-destructive">*</span></Label>
              <Select value={workLocation} onValueChange={setWorkLocation} required>
                <SelectTrigger id="workLocation">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Educational & Skill Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Section 4: Educational & Skill Details</CardTitle>
            </div>
            <CardDescription>Qualifications, certifications, and technical skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="highestQualification">Highest Qualification</Label>
                <Input id="highestQualification" value={highestQualification} onChange={(e) => setHighestQualification(e.target.value)} placeholder="e.g., B.Tech, M.Sc" />
              </div>
              <div>
                <Label htmlFor="degreeCertificateUrl">Degree Certificate URL</Label>
                <Input id="degreeCertificateUrl" type="url" value={degreeCertificateUrl} onChange={(e) => setDegreeCertificateUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            
            <div>
              <Label>Technical Skills</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {technicalSkillsOptions.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={technicalSkills.includes(skill)}
                      onCheckedChange={() => handleTechnicalSkillToggle(skill)}
                    />
                    <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">{skill}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="certificationInput">Certifications URLs (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="certificationInput"
                  type="url"
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  placeholder="https://certification-url.com"
                />
                <Button type="button" variant="outline" onClick={addCertification}>Add</Button>
              </div>
              {certificationsUrls.length > 0 && (
                <div className="mt-2 space-y-2">
                  {certificationsUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate flex-1">{url}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(index)}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Previous Employment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Section 5: Previous Employment Information</CardTitle>
            </div>
            <CardDescription>For experienced candidates only</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="previousCompany">Previous Company Name</Label>
              <Input id="previousCompany" value={previousCompany} onChange={(e) => setPreviousCompany(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="previousJobTitle">Previous Job Title</Label>
              <Input id="previousJobTitle" value={previousJobTitle} onChange={(e) => setPreviousJobTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="totalExperience">Total Experience (in years)</Label>
              <Input id="totalExperience" value={totalExperience} onChange={(e) => setTotalExperience(e.target.value)} placeholder="e.g., 2.5 years" />
            </div>
            <div>
              <Label htmlFor="uanNumber">UAN Number</Label>
              <Input id="uanNumber" value={uanNumber} onChange={(e) => setUanNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="experienceLetterUrl">Experience Letter / Relieving Letter URL</Label>
              <Input id="experienceLetterUrl" type="url" value={experienceLetterUrl} onChange={(e) => setExperienceLetterUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="lastSalarySlipUrl">Last Salary Slip URL</Label>
              <Input id="lastSalarySlipUrl" type="url" value={lastSalarySlipUrl} onChange={(e) => setLastSalarySlipUrl(e.target.value)} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Bank Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Section 6: Bank Details (For Salary Processing)</CardTitle>
            </div>
            <CardDescription>Banking information for payroll</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="bankAccountNumber">Bank Account Number <span className="text-destructive">*</span></Label>
              <Input id="bankAccountNumber" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="ifscCode">IFSC Code <span className="text-destructive">*</span></Label>
              <Input id="ifscCode" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} required placeholder="SBIN0001234" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bankNameBranch">Bank Name & Branch <span className="text-destructive">*</span></Label>
              <Input id="bankNameBranch" value={bankNameBranch} onChange={(e) => setBankNameBranch(e.target.value)} required placeholder="e.g., State Bank of India, MG Road Branch" />
            </div>
            <div>
              <Label htmlFor="cancelledChequeUrl">Cancelled Cheque / Passbook Copy URL <span className="text-destructive">*</span></Label>
              <Input id="cancelledChequeUrl" type="url" value={cancelledChequeUrl} onChange={(e) => setCancelledChequeUrl(e.target.value)} required placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Tax Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Section 7: Tax Information</CardTitle>
            </div>
            <CardDescription>Tax regime and investment proofs</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="taxRegime">Choose Tax Regime <span className="text-destructive">*</span></Label>
              <Select value={taxRegime} onValueChange={setTaxRegime} required>
                <SelectTrigger id="taxRegime">
                  <SelectValue placeholder="Select regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-tax-regime">New Tax Regime</SelectItem>
                  <SelectItem value="old-tax-regime">Old Tax Regime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="investmentProofsUrl">Investment Proofs URL (Optional)</Label>
              <Input id="investmentProofsUrl" type="url" value={investmentProofsUrl} onChange={(e) => setInvestmentProofsUrl(e.target.value)} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Section 8: IT & System Setup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              <CardTitle>Section 8: IT & System Setup Requirements</CardTitle>
            </div>
            <CardDescription>Hardware and software requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="laptopRequired">Laptop Required? <span className="text-destructive">*</span></Label>
                <Select value={laptopRequired} onValueChange={setLaptopRequired} required>
                  <SelectTrigger id="laptopRequired">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="already-have">Already have company-provided device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tshirtSize">T-shirt Size (For company kit)</Label>
                <Select value={tshirtSize} onValueChange={setTshirtSize}>
                  <SelectTrigger id="tshirtSize">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s">S</SelectItem>
                    <SelectItem value="m">M</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                    <SelectItem value="xxl">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Software Access Required</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {softwareAccessOptions.map((software) => (
                  <div key={software} className="flex items-center space-x-2">
                    <Checkbox
                      id={`software-${software}`}
                      checked={softwareAccess.includes(software)}
                      onCheckedChange={() => handleSoftwareAccessToggle(software)}
                    />
                    <label htmlFor={`software-${software}`} className="text-sm cursor-pointer">{software}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 9: Policy Agreements */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Section 9: Policy Agreements (Digital Consent)</CardTitle>
            </div>
            <CardDescription>Please agree to all required policies <span className="text-destructive">*</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>I have read and agree to the following:</Label>
              <div className="space-y-3 mt-2">
                {policyOptions.map((policy) => (
                  <div key={policy} className="flex items-center space-x-2">
                    <Checkbox
                      id={`policy-${policy}`}
                      checked={policyAgreements.includes(policy)}
                      onCheckedChange={() => handlePolicyToggle(policy)}
                    />
                    <label htmlFor={`policy-${policy}`} className="text-sm cursor-pointer">{policy}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="signature">Digital Signature (Type your full name) <span className="text-destructive">*</span></Label>
              <Input id="signature" value={signature} onChange={(e) => setSignature(e.target.value)} required placeholder="Type your full name" />
            </div>
          </CardContent>
        </Card>

        {/* Section 10: Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Section 10: Additional Information</CardTitle>
            <CardDescription>Optional details about yourself and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
              <Input id="linkedinProfile" type="url" value={linkedinProfile} onChange={(e) => setLinkedinProfile(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <Label htmlFor="aboutYourself">Tell us about yourself</Label>
              <Textarea id="aboutYourself" value={aboutYourself} onChange={(e) => setAboutYourself(e.target.value)} rows={4} placeholder="Share a short introduction about yourself..." />
            </div>
            <div>
              <Label htmlFor="workPreferences">Work Preferences</Label>
              <Textarea id="workPreferences" value={workPreferences} onChange={(e) => setWorkPreferences(e.target.value)} rows={3} placeholder="What motivates you? What work environment do you prefer?" />
            </div>
            <div>
              <Label htmlFor="careerGoals">Career Goals</Label>
              <Textarea id="careerGoals" value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} rows={3} placeholder="What are your short-term and long-term career goals?" />
            </div>
            <div>
              <Label htmlFor="hobbies">Hobbies & Interests</Label>
              <Textarea id="hobbies" value={hobbies} onChange={(e) => setHobbies(e.target.value)} rows={2} placeholder="What are your hobbies or interests outside of work?" />
            </div>
            <div>
              <Label htmlFor="specialAccommodations">Special Accommodations Needed</Label>
              <Textarea id="specialAccommodations" value={specialAccommodations} onChange={(e) => setSpecialAccommodations(e.target.value)} rows={2} placeholder="Any special requirements or accommodations?" />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/onboarding/${params.id}`)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}
