"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loading-spinner"
import { ReviewFormComponent } from "@/components/reviews/review-form-component"
import { useSession } from "@/lib/auth-client"
import { ArrowLeft, User, Mail, Briefcase, Calendar } from "lucide-react"
import { toast } from "sonner"

interface ReviewForm {
  id: number
  cycleId: number
  employeeId: string
  reviewerId: string
  reviewerType: string
  status: string
  overallRating: number | null
  goalsAchievement: string | null
  strengths: string | null
  improvements: string | null
  kpiScores: string | null
  additionalComments: string | null
  submittedAt: string | null
  cycle: { id: number; name: string; status: string; endDate: string; startDate: string } | null
  employee: { id: string; name: string; email: string; role: string } | null
  reviewer: { id: string; name: string; email: string } | null
}

export default function ReviewFormPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, isPending } = useSession()
  const [reviewData, setReviewData] = useState<ReviewForm | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login")
      } else {
        fetchReviewData()
      }
    }
  }, [session, isPending, params.id])

  const fetchReviewData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/forms/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch review data")
      }

      const data = await response.json()
      setReviewData(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load review form")
      router.push("/reviews")
    } finally {
      setIsLoading(false)
    }
  }

  if (isPending || isLoading) {
    return (
      <DashboardLayout userRole={session?.user?.role || "employee"}>
        <PageLoader text="Loading review form..." />
      </DashboardLayout>
    )
  }

  if (!session?.user || !reviewData) {
    return null
  }

  const userRole = session.user.role?.toLowerCase() || "employee"
  const isReadOnly = reviewData.status === "submitted"

  const getReviewerTypeColor = (type: string) => {
    switch (type) {
      case "self": return "bg-purple-500"
      case "peer": return "bg-blue-500"
      case "client": return "bg-green-500"
      case "manager": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-green-500"
      case "draft": return "bg-gray-500"
      case "pending": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  return (
    <DashboardLayout userRole={userRole as "admin" | "employee" | "intern"}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/reviews")}
          className="hover:bg-[#00C2FF]/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reviews
        </Button>

        {/* Header with Employee Details */}
        <Card className="border-[#00C2FF]/20 bg-gradient-to-r from-[#00C2FF]/5 via-transparent to-[#0A1A2F]/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                  {reviewData.reviewerType === "self" 
                    ? "Self Review Form" 
                    : `Performance Review Form`}
                </CardTitle>
                <CardDescription className="text-base">
                  {isReadOnly 
                    ? "Viewing submitted review" 
                    : "Complete the review form below. Your progress is auto-saved every 30 seconds."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getStatusColor(reviewData.status)} text-white capitalize`}>
                  {reviewData.status}
                </Badge>
                <Badge variant="outline" className={`${getReviewerTypeColor(reviewData.reviewerType)} text-white capitalize`}>
                  {reviewData.reviewerType}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Employee Details Card */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-[#00C2FF]/20">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3 text-[#00C2FF]">
                  {reviewData.reviewerType === "self" ? "Your Information" : "Employee Being Reviewed"}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-[#00C2FF]" />
                  <span className="font-medium">Name:</span>
                  <span>{reviewData.employee?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#00C2FF]" />
                  <span className="font-medium">Email:</span>
                  <span>{reviewData.employee?.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-[#00C2FF]" />
                  <span className="font-medium">Role:</span>
                  <span className="capitalize">{reviewData.employee?.role || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3 text-[#00C2FF]">Review Cycle Details</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#00C2FF]" />
                  <span className="font-medium">Cycle:</span>
                  <span>{reviewData.cycle?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#00C2FF]" />
                  <span className="font-medium">Start Date:</span>
                  <span>
                    {reviewData.cycle?.startDate 
                      ? new Date(reviewData.cycle.startDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#00C2FF]" />
                  <span className="font-medium">End Date:</span>
                  <span>
                    {reviewData.cycle?.endDate 
                      ? new Date(reviewData.cycle.endDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form Component */}
        <ReviewFormComponent
          cycleId={reviewData.cycleId}
          employeeId={reviewData.employeeId}
          employeeName={reviewData.employee?.name || "Employee"}
          reviewerId={reviewData.reviewerId}
          reviewerType={reviewData.reviewerType as any}
          existingFormId={reviewData.id}
          existingData={{
            overallRating: reviewData.overallRating || undefined,
            goalsAchievement: reviewData.goalsAchievement || undefined,
            strengths: reviewData.strengths || undefined,
            improvements: reviewData.improvements || undefined,
            kpiScores: reviewData.kpiScores ? JSON.parse(reviewData.kpiScores) : undefined,
            additionalComments: reviewData.additionalComments || undefined,
          }}
          onSuccess={() => {
            toast.success("Review submitted successfully!")
            router.push("/reviews")
          }}
          onCancel={() => {
            router.push("/reviews")
          }}
          readOnly={isReadOnly}
        />
      </div>
    </DashboardLayout>
  )
}
