"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  FileText,
  Eye,
  Edit,
  Calendar,
  TrendingUp,
  Bell,
} from "lucide-react"
import { toast } from "sonner"
import { ReviewFormComponent } from "./review-form-component"
import { useSession } from "@/lib/auth-client"

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
  cycle: { id: number; name: string; status: string; endDate: string } | null
  employee: { id: string; name: string; email: string } | null
  reviewer: { id: string; name: string; email: string } | null
}

interface ReviewStats {
  myPendingReviews: number
  myCompletedReviews: number
  reviewsAboutMe: number
  myAverageRating: number | null
  upcomingDeadlines: any[]
}

interface Notification {
  id: number
  notificationType: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function EmployeeReviewDashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [myReviews, setMyReviews] = useState<ReviewForm[]>([])
  const [reviewsAboutMe, setReviewsAboutMe] = useState<ReviewForm[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewForm | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchMyReviews(),
        fetchReviewsAboutMe(),
        fetchStats(),
        fetchNotifications(),
      ])
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/forms?reviewerId=${session?.user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch my reviews")
      const data = await response.json()
      setMyReviews(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchReviewsAboutMe = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/forms?employeeId=${session?.user?.id}&status=submitted`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch reviews about me")
      const data = await response.json()
      setReviewsAboutMe(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/notifications?isRead=false&limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch notifications")
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkNotificationRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      await fetch(`/api/reviews/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      fetchNotifications()
    } catch (error) {
      console.error(error)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your reviews..." />
      </div>
    )
  }

  const pendingReviews = myReviews.filter(r => r.status === "pending" || r.status === "draft")
  const completedReviews = myReviews.filter(r => r.status === "submitted")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
          Performance Reviews
        </h1>
        <p className="text-muted-foreground">
          Complete your reviews and view feedback from your peers
        </p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="border-[#00C2FF]/20 bg-[#00C2FF]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-[#00C2FF]" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-3 rounded-lg border border-[#00C2FF]/20 bg-background hover:bg-[#00C2FF]/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMarkNotificationRead(notification.id)}
                  className="hover:bg-[#00C2FF]/10"
                >
                  Mark Read
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.myPendingReviews || 0}
            </div>
            <p className="text-xs text-muted-foreground">To complete</p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.myCompletedReviews || 0}
            </div>
            <p className="text-xs text-muted-foreground">Reviews done</p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews About Me</CardTitle>
            <FileText className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.reviewsAboutMe || 0}
            </div>
            <p className="text-xs text-muted-foreground">Received</p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.myAverageRating ? stats.myAverageRating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="border border-[#00C2FF]/20">
          <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">
            My Pending Reviews
            {pendingReviews.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingReviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">
            Completed Reviews
          </TabsTrigger>
          <TabsTrigger value="about-me" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">
            Reviews About Me
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews */}
        <TabsContent value="pending">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Reviews to Complete
              </CardTitle>
              <CardDescription>Reviews you need to fill out</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                    All caught up!
                  </h3>
                  <p>No pending reviews at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent hover:from-[#00C2FF]/10 hover:to-[#00C2FF]/10 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg border border-orange-500/30">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {review.reviewerType === "self"
                                ? "Self Review"
                                : `Review for ${review.employee?.name || "Employee"}`}
                            </h4>
                            <Badge className={`${getStatusColor(review.status)} text-white capitalize`}>
                              {review.status}
                            </Badge>
                            <Badge variant="outline" className="bg-[#00C2FF]/10 text-[#00C2FF] capitalize">
                              {review.reviewerType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cycle: {review.cycle?.name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Due: {review.cycle?.endDate ? new Date(review.cycle.endDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedReview(review)
                          setIsReviewDialogOpen(true)
                        }}
                        className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {review.status === "draft" ? "Continue" : "Start Review"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Reviews */}
        <TabsContent value="completed">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Completed Reviews
              </CardTitle>
              <CardDescription>Reviews you've submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {completedReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                    No completed reviews yet
                  </h3>
                  <p>Your completed reviews will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/30">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              {review.reviewerType === "self"
                                ? "Self Review"
                                : `Review for ${review.employee?.name || "Employee"}`}
                            </h4>
                            <Badge className="bg-green-500 text-white">Submitted</Badge>
                            {review.overallRating && (
                              <span className="text-sm text-yellow-500">
                                ⭐ {review.overallRating}/5
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cycle: {review.cycle?.name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setIsViewDialogOpen(true)
                        }}
                        className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews About Me */}
        <TabsContent value="about-me">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Reviews About Me
              </CardTitle>
              <CardDescription>Feedback received from peers and managers</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsAboutMe.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                  <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                    No reviews yet
                  </h3>
                  <p>Reviews from your peers will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewsAboutMe.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-start justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg border border-blue-500/30">
                          <Star className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">
                              From: {review.reviewer?.name || "Anonymous"}
                            </h4>
                            <Badge variant="outline" className="bg-[#00C2FF]/10 text-[#00C2FF] capitalize">
                              {review.reviewerType}
                            </Badge>
                            {review.overallRating && (
                              <span className="text-sm text-yellow-500 font-medium">
                                ⭐ {review.overallRating}/5
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Cycle: {review.cycle?.name || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setIsViewDialogOpen(true)
                        }}
                        className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Form Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-[#00C2FF]/20">
          {selectedReview && (
            <ReviewFormComponent
              cycleId={selectedReview.cycleId}
              employeeId={selectedReview.employeeId}
              employeeName={selectedReview.employee?.name || "Employee"}
              reviewerId={selectedReview.reviewerId}
              reviewerType={selectedReview.reviewerType as any}
              existingFormId={selectedReview.id}
              existingData={{
                overallRating: selectedReview.overallRating || undefined,
                goalsAchievement: selectedReview.goalsAchievement || undefined,
                strengths: selectedReview.strengths || undefined,
                improvements: selectedReview.improvements || undefined,
                kpiScores: selectedReview.kpiScores ? JSON.parse(selectedReview.kpiScores) : undefined,
                additionalComments: selectedReview.additionalComments || undefined,
              }}
              onSuccess={() => {
                setIsReviewDialogOpen(false)
                fetchData()
              }}
              onCancel={() => setIsReviewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-[#00C2FF]/20">
          {selectedReview && (
            <ReviewFormComponent
              cycleId={selectedReview.cycleId}
              employeeId={selectedReview.employeeId}
              employeeName={selectedReview.employee?.name || "Employee"}
              reviewerId={selectedReview.reviewerId}
              reviewerType={selectedReview.reviewerType as any}
              existingFormId={selectedReview.id}
              existingData={{
                overallRating: selectedReview.overallRating || undefined,
                goalsAchievement: selectedReview.goalsAchievement || undefined,
                strengths: selectedReview.strengths || undefined,
                improvements: selectedReview.improvements || undefined,
                kpiScores: selectedReview.kpiScores ? JSON.parse(selectedReview.kpiScores) : undefined,
                additionalComments: selectedReview.additionalComments || undefined,
              }}
              onCancel={() => setIsViewDialogOpen(false)}
              readOnly={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
