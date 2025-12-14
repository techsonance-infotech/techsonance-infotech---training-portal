"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  Download,
  MessageSquare,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

interface ReviewForm {
  id: number
  employeeId: string
  reviewerId: string
  reviewerType: string
  status: string
  overallRating: number | null
  submittedAt: string | null
  employee: { id: string; name: string; email: string } | null
  reviewer: { id: string; name: string; email: string } | null
  cycle: { id: number; name: string; status: string } | null
}

interface ReviewStats {
  totalForms: number
  submittedForms: number
  pendingForms: number
  averageRating: number | null
}

export function HRReviewDashboard() {
  const [reviews, setReviews] = useState<ReviewForm[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewForm | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [isSavingComment, setIsSavingComment] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchReviews(), fetchStats()])
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/forms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/reviews/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddComment = async () => {
    if (!selectedReview || !comment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    setIsSavingComment(true)
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/forms/${selectedReview.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: comment.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add comment")
      }

      toast.success("Comment added successfully")
      setComment("")
      setIsCommentDialogOpen(false)
      setSelectedReview(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment")
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleExportReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/forms/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch review")

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `review-${reviewId}-export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Review exported successfully")
    } catch (error) {
      toast.error("Failed to export review")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-green-500"
      case "approved": return "bg-blue-500"
      case "pending": return "bg-yellow-500"
      case "draft": return "bg-gray-500"
      default: return "bg-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading HR dashboard..." />
      </div>
    )
  }

  const submittedReviews = reviews.filter(r => r.status === "submitted" || r.status === "approved")
  const pendingReviews = reviews.filter(r => r.status === "pending" || r.status === "draft")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
          HR Review Dashboard
        </h1>
        <p className="text-muted-foreground">
          View all reviews, export reports, and add final comments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.totalForms || 0}
            </div>
            <p className="text-xs text-muted-foreground">All review forms</p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.submittedForms || 0}
            </div>
            <p className="text-xs text-muted-foreground">Completed reviews</p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.pendingForms || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      <Tabs defaultValue="submitted">
        <TabsList className="border border-[#00C2FF]/20">
          <TabsTrigger value="submitted" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">
            Submitted Reviews
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">
            Pending Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submitted">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Submitted Reviews
              </CardTitle>
              <CardDescription>All completed performance reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No submitted reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    submittedReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          {review.employee?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{review.reviewer?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#00C2FF]/10 text-[#00C2FF] capitalize">
                            {review.reviewerType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {review.overallRating ? (
                            <span className="text-yellow-500 font-medium">
                              ⭐ {review.overallRating}/5
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {review.submittedAt
                            ? new Date(review.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReview(review)
                                setIsCommentDialogOpen(true)
                              }}
                              className="hover:bg-[#00C2FF]/10"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportReview(review.id)}
                              className="hover:bg-[#00C2FF]/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Pending Reviews
              </CardTitle>
              <CardDescription>Reviews awaiting completion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No pending reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          {review.employee?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{review.reviewer?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#00C2FF]/10 text-[#00C2FF] capitalize">
                            {review.reviewerType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(review.status)} text-white capitalize`}>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {review.cycle?.name || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="border-[#00C2FF]/20">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              Add HR Comment
            </DialogTitle>
            <DialogDescription>
              Add your comments to the review for {selectedReview?.employee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Your Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your HR comments on this review..."
                rows={6}
                className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentDialogOpen(false)
                setComment("")
                setSelectedReview(null)
              }}
              className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
              disabled={isSavingComment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white"
              disabled={isSavingComment}
            >
              {isSavingComment ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Add Comment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
