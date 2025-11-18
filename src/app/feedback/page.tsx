"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner, PageLoader } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MessageSquare,
  Plus,
  Send,
  Star,
  Clock,
  CheckCircle2,
  User,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"

interface FeedbackRequest {
  id: number
  requesterId: number
  reviewerId: number
  year: number
  status: string
  createdAt: string
}

interface FeedbackResponse {
  id: number
  requestId: number
  rating: number
  skillsEvaluation: string
  comments: string
  submittedAt: string
}

export default function FeedbackPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<FeedbackRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FeedbackRequest | null>(null)
  const [newRequest, setNewRequest] = useState({
    reviewerId: "",
    year: new Date().getFullYear(),
  })
  const [newResponse, setNewResponse] = useState({
    rating: 5,
    skillsEvaluation: "",
    comments: "",
  })

  useEffect(() => {
    fetchFeedbackRequests()
  }, [])

  const fetchFeedbackRequests = async () => {
    setIsLoading(true)
    try {
      // In real app, filter by current user ID
      const response = await fetch("/api/feedback?userId=2")
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      toast.error("Failed to load feedback requests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestFeedback = async () => {
    if (!newRequest.reviewerId) {
      toast.error("Please select a reviewer")
      return
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterId: 2, // In real app, use actual user ID
          reviewerId: parseInt(newRequest.reviewerId),
          year: newRequest.year,
        }),
      })

      if (!response.ok) throw new Error("Failed to request feedback")

      const data = await response.json()
      setRequests([...requests, data])
      setNewRequest({ reviewerId: "", year: new Date().getFullYear() })
      setIsRequestDialogOpen(false)
      toast.success("Feedback request sent successfully")
    } catch (error) {
      toast.error("Failed to send feedback request")
    }
  }

  const handleSubmitResponse = async () => {
    if (!selectedRequest) return

    if (!newResponse.skillsEvaluation.trim() || !newResponse.comments.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const response = await fetch(`/api/feedback/${selectedRequest.id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: newResponse.rating,
          skillsEvaluation: newResponse.skillsEvaluation,
          comments: newResponse.comments,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit response")

      // Update request status
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id ? { ...req, status: "completed" } : req
        )
      )
      setNewResponse({ rating: 5, skillsEvaluation: "", comments: "" })
      setSelectedRequest(null)
      setIsResponseDialogOpen(false)
      toast.success("Feedback submitted successfully")
    } catch (error) {
      toast.error("Failed to submit feedback")
    }
  }

  const myRequests = requests.filter((req) => req.requesterId === 2)
  const pendingReviews = requests.filter((req) => req.reviewerId === 2 && req.status === "pending")
  const completedReviews = requests.filter((req) => req.status === "completed")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="employee">
        <PageLoader text="Loading feedback..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Peer Feedback</h1>
            <p className="text-muted-foreground">
              Request and provide feedback for annual performance reviews
            </p>
          </div>
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Request Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="border-[#00C2FF]/20">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Request Peer Feedback</DialogTitle>
                <DialogDescription>
                  Request feedback from a colleague for your annual review
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewer">Select Reviewer *</Label>
                  <Select
                    value={newRequest.reviewerId}
                    onValueChange={(value) => setNewRequest({ ...newRequest, reviewerId: value })}
                  >
                    <SelectTrigger className="border-[#00C2FF]/30 focus:border-[#00C2FF]">
                      <SelectValue placeholder="Choose a colleague" />
                    </SelectTrigger>
                    <SelectContent className="border-[#00C2FF]/20">
                      <SelectItem value="1">System Administrator</SelectItem>
                      <SelectItem value="3">Jane Smith</SelectItem>
                      <SelectItem value="4">Alex Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Review Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newRequest.year}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, year: parseInt(e.target.value) })
                    }
                    className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10">
                  Cancel
                </Button>
                <Button onClick={handleRequestFeedback} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white">Send Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {myRequests.length}
              </div>
              <p className="text-xs text-muted-foreground">Total feedback requests</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500 delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {pendingReviews.length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {completedReviews.length}
              </div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Tabs */}
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="border border-[#00C2FF]/20">
            <TabsTrigger value="requests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">My Requests</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">
              Pending Reviews
              {pendingReviews.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>

          {/* My Requests Tab */}
          <TabsContent value="requests">
            <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-500">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">My Feedback Requests</CardTitle>
                <CardDescription>Feedback requests you've sent to colleagues</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading requests..." />
                  </div>
                ) : myRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                    <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">No requests yet</h3>
                    <p className="mb-4">
                      Request feedback from your colleagues for your annual review
                    </p>
                    <Button onClick={() => setIsRequestDialogOpen(true)} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Send Your First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent hover:from-[#00C2FF]/10 hover:to-[#00C2FF]/10 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-2 rounded-lg">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">Reviewer ID: {request.reviewerId}</h4>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(request.status)} text-white border-none`}
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Review Year: {request.year}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Requested on {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Reviews Tab */}
          <TabsContent value="pending">
            <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-500">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Pending Reviews</CardTitle>
                <CardDescription>
                  Feedback requests from colleagues awaiting your response
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading pending reviews..." />
                  </div>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                    <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">All caught up!</h3>
                    <p>No pending feedback requests at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReviews.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent hover:from-[#00C2FF]/10 hover:to-[#00C2FF]/10 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg border border-orange-500/30">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                Requester ID: {request.requesterId}
                              </h4>
                              <Badge variant="outline" className="bg-yellow-500 text-white border-none">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Review Year: {request.year}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Requested on {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedRequest(request)
                            setIsResponseDialogOpen(true)
                          }}
                          className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-500">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Feedback History</CardTitle>
                <CardDescription>
                  All completed feedback requests and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading history..." />
                  </div>
                ) : completedReviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                    <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">No history yet</h3>
                    <p>Completed feedback requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedReviews.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent hover:from-[#00C2FF]/10 hover:to-[#00C2FF]/10 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-green-500/10 text-green-500 p-2 rounded-lg border border-green-500/30">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">
                                {request.requesterId === 2 ? `Reviewer: ${request.reviewerId}` : `Requester: ${request.requesterId}`}
                              </h4>
                              <Badge variant="outline" className="bg-green-500 text-white border-none">
                                Completed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Review Year: {request.year}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Completed {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className="max-w-2xl border-[#00C2FF]/20">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Submit Feedback</DialogTitle>
              <DialogDescription>
                Provide constructive feedback for your colleague's annual review
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Overall Rating *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewResponse({ ...newResponse, rating })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          rating <= newResponse.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-[#00C2FF]">
                    {newResponse.rating} / 5
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills Evaluation *</Label>
                <Textarea
                  id="skills"
                  placeholder="Evaluate technical skills, collaboration abilities, problem-solving, etc..."
                  value={newResponse.skillsEvaluation}
                  onChange={(e) =>
                    setNewResponse({ ...newResponse, skillsEvaluation: e.target.value })
                  }
                  rows={4}
                  className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Additional Comments *</Label>
                <Textarea
                  id="comments"
                  placeholder="Provide constructive feedback, strengths, areas for improvement..."
                  value={newResponse.comments}
                  onChange={(e) => setNewResponse({ ...newResponse, comments: e.target.value })}
                  rows={4}
                  className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsResponseDialogOpen(false)
                  setSelectedRequest(null)
                  setNewResponse({ rating: 5, skillsEvaluation: "", comments: "" })
                }}
                className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitResponse} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}