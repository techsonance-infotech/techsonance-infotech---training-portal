"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Users,
  Lock,
  Unlock,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  TrendingUp,
  ClipboardList,
  Eye,
  UserCheck,
  FileText,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"

interface ReviewCycle {
  id: number
  name: string
  cycleType: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt: string
}

interface ReviewStats {
  totalCycles: number
  activeCycles: number
  totalForms: number
  submittedForms: number
  pendingForms: number
  draftForms: number
  averageRating: number | null
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  id: number
  cycleId: number
  employeeId: string
  reviewerId: string
  reviewerType: string
  status: string
  notifiedAt: string | null
  createdAt: string
  employee: User | null
  reviewer: User | null
}

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
  kpiScores: any
  additionalComments: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  employee: User | null
  reviewer: User | null
  cycle: ReviewCycle | null
}

export function AdminReviewDashboard() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [reviewForms, setReviewForms] = useState<ReviewForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("assignments")
  const [selectedForm, setSelectedForm] = useState<ReviewForm | null>(null)
  
  // Dialog states
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false)
  const [isAssignReviewersOpen, setIsAssignReviewersOpen] = useState(false)
  const [isViewFormOpen, setIsViewFormOpen] = useState(false)
  
  // Form states
  const [newCycle, setNewCycle] = useState({
    name: "",
    cycleType: "6-month",
    startDate: "",
    endDate: "",
    status: "draft",
  })
  
  const [assignmentForm, setAssignmentForm] = useState({
    cycleId: "",
    employeeId: "",
    reviewerIds: [] as string[],
    reviewerTypes: {} as Record<string, string>,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchCycles(),
        fetchStats(),
        fetchUsers(),
        fetchAssignments(),
        fetchReviewForms(),
      ])
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCycles = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/cycles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch cycles")
      const data = await response.json()
      setCycles(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/forms?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch assignments")
      const data = await response.json()
      
      // Group assignments with their forms
      const assignmentMap = new Map<string, Assignment>()
      data.forEach((form: ReviewForm) => {
        const key = `${form.cycleId}-${form.employeeId}-${form.reviewerId}-${form.reviewerType}`
        if (!assignmentMap.has(key)) {
          assignmentMap.set(key, {
            id: form.id,
            cycleId: form.cycleId,
            employeeId: form.employeeId,
            reviewerId: form.reviewerId,
            reviewerType: form.reviewerType,
            status: form.status === 'submitted' ? 'completed' : 'pending',
            notifiedAt: form.createdAt,
            createdAt: form.createdAt,
            employee: form.employee,
            reviewer: form.reviewer,
          })
        }
      })
      setAssignments(Array.from(assignmentMap.values()))
    } catch (error) {
      console.error(error)
    }
  }

  const fetchReviewForms = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/forms?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch review forms")
      const data = await response.json()
      setReviewForms(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateCycle = async () => {
    if (!newCycle.name || !newCycle.startDate || !newCycle.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/reviews/cycles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCycle),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create cycle")
      }

      toast.success("Review cycle created successfully")
      setIsCreateCycleOpen(false)
      setNewCycle({
        name: "",
        cycleType: "6-month",
        startDate: "",
        endDate: "",
        status: "draft",
      })
      fetchCycles()
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to create cycle")
    }
  }

  const handleLockCycle = async (cycleId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/cycles/${cycleId}/lock`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to lock cycle")
      }

      toast.success("Review cycle locked successfully")
      fetchCycles()
    } catch (error: any) {
      toast.error(error.message || "Failed to lock cycle")
    }
  }

  const handleReopenCycle = async (cycleId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/cycles/${cycleId}/reopen`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reopen cycle")
      }

      toast.success("Review cycle reopened successfully")
      fetchCycles()
    } catch (error: any) {
      toast.error(error.message || "Failed to reopen cycle")
    }
  }

  const handleDeleteCycle = async (cycleId: number) => {
    if (!confirm("Are you sure you want to delete this review cycle?")) {
      return
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/cycles/${cycleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete cycle")
      }

      toast.success("Review cycle deleted successfully")
      fetchCycles()
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete cycle")
    }
  }

  const handleAssignReviewers = async () => {
    if (!assignmentForm.cycleId || !assignmentForm.employeeId || assignmentForm.reviewerIds.length === 0) {
      toast.error("Please select cycle, employee, and at least one reviewer")
      return
    }

    const assignments = assignmentForm.reviewerIds.map(reviewerId => ({
      employeeId: assignmentForm.employeeId,
      reviewerId,
      reviewerType: assignmentForm.reviewerTypes[reviewerId] || "peer",
    }))

    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/cycles/${assignmentForm.cycleId}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignments }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to assign reviewers")
      }

      toast.success("Reviewers assigned successfully")
      setIsAssignReviewersOpen(false)
      setAssignmentForm({
        cycleId: "",
        employeeId: "",
        reviewerIds: [],
        reviewerTypes: {},
      })
      fetchAssignments()
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to assign reviewers")
    }
  }

  const handleExportCycle = async (cycleId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/export/${cycleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to export cycle")

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `review-cycle-${cycleId}-export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Cycle exported successfully")
    } catch (error) {
      toast.error("Failed to export cycle")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "draft": return "bg-gray-500"
      case "locked": return "bg-orange-500"
      case "completed": return "bg-blue-500"
      case "submitted": return "bg-green-500"
      case "pending": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  const getReviewerTypeColor = (type: string) => {
    switch (type) {
      case "self": return "bg-purple-500"
      case "peer": return "bg-blue-500"
      case "client": return "bg-green-500"
      case "manager": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
            Review Management
          </h1>
          <p className="text-muted-foreground">
            Manage review cycles, assign reviewers, and monitor progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAssignReviewersOpen(true)}
            variant="outline"
            className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
          >
            <Users className="h-4 w-4 mr-2" />
            Assign Reviewers
          </Button>
          <Button
            onClick={() => setIsCreateCycleOpen(true)}
            className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Cycle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cycles</CardTitle>
            <ClipboardList className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.totalCycles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeCycles || 0} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Reviews</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.submittedForms || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {stats?.totalForms || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-[#00C2FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {stats?.pendingForms || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.draftForms || 0} drafts saved
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#00C2FF]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments">Assigned Reviews</TabsTrigger>
          <TabsTrigger value="cycles">Review Cycles</TabsTrigger>
        </TabsList>

        {/* Assigned Reviews Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Assigned Reviews with Details
              </CardTitle>
              <CardDescription>View all assigned reviews with responses and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewForms.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No review assignments found. Start by creating a cycle and assigning reviewers.
                  </div>
                ) : (
                  reviewForms.map((form) => (
                    <Card key={form.id} className="border-[#00C2FF]/10">
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          {/* Header Info */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-[#00C2FF]" />
                                <span className="font-semibold">{form.reviewer?.name || "Unknown Reviewer"}</span>
                                <Badge className={`${getReviewerTypeColor(form.reviewerType)} text-white`}>
                                  {form.reviewerType}
                                </Badge>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">{form.employee?.name || "Unknown Employee"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{form.cycle?.name || `Cycle ${form.cycleId}`}</span>
                                <span>•</span>
                                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusColor(form.status)} text-white`}>
                                {form.status}
                              </Badge>
                              {form.status === 'submitted' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedForm(form)
                                    setIsViewFormOpen(true)
                                  }}
                                  className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Review Details (if submitted) */}
                          {form.status === 'submitted' && (
                            <div className="grid gap-3 pt-3 border-t border-[#00C2FF]/10">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Overall Rating:</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {form.overallRating ? (
                                      <>
                                        <span className="text-2xl font-bold text-[#00C2FF]">{form.overallRating}</span>
                                        <span className="text-sm text-muted-foreground">/5</span>
                                      </>
                                    ) : (
                                      <span className="text-muted-foreground">Not rated</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Submitted:</span>
                                  <div className="mt-1">
                                    <span className="text-sm">{form.submittedAt ? new Date(form.submittedAt).toLocaleString() : "N/A"}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {form.strengths && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Strengths:</span>
                                  <p className="text-sm mt-1 line-clamp-2">{form.strengths}</p>
                                </div>
                              )}
                              
                              {form.improvements && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Areas for Improvement:</span>
                                  <p className="text-sm mt-1 line-clamp-2">{form.improvements}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {form.status === 'draft' && (
                            <div className="text-sm text-muted-foreground pt-3 border-t border-[#00C2FF]/10">
                              Review is in draft status. Last updated: {new Date(form.updatedAt).toLocaleString()}
                            </div>
                          )}

                          {form.status === 'pending' && (
                            <div className="text-sm text-muted-foreground pt-3 border-t border-[#00C2FF]/10">
                              Awaiting review submission from {form.reviewer?.name}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Cycles Tab */}
        <TabsContent value="cycles">
          <Card className="border-[#00C2FF]/20">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                Review Cycles
              </CardTitle>
              <CardDescription>Manage and monitor all review cycles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No review cycles found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cycles.map((cycle) => (
                      <TableRow key={cycle.id}>
                        <TableCell className="font-medium">{cycle.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#00C2FF]/10 text-[#00C2FF]">
                            {cycle.cycleType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(cycle.startDate).toLocaleDateString()} -{" "}
                          {new Date(cycle.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(cycle.status)} text-white`}>
                            {cycle.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportCycle(cycle.id)}
                              className="hover:bg-[#00C2FF]/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {cycle.status === "locked" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReopenCycle(cycle.id)}
                                className="hover:bg-[#00C2FF]/10"
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleLockCycle(cycle.id)}
                                className="hover:bg-[#00C2FF]/10"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCycle(cycle.id)}
                              className="hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </Tabs>

      {/* Create Cycle Dialog */}
      <Dialog open={isCreateCycleOpen} onOpenChange={setIsCreateCycleOpen}>
        <DialogContent className="border-[#00C2FF]/20">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              Create Review Cycle
            </DialogTitle>
            <DialogDescription>
              Set up a new performance review cycle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cycle Name *</Label>
              <Input
                id="name"
                placeholder="e.g., H1 2025 Review"
                value={newCycle.name}
                onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycleType">Cycle Type *</Label>
              <Select
                value={newCycle.cycleType}
                onValueChange={(value) => setNewCycle({ ...newCycle, cycleType: value })}
              >
                <SelectTrigger className="border-[#00C2FF]/30 focus:border-[#00C2FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#00C2FF]/20">
                  <SelectItem value="6-month">6-Month Review</SelectItem>
                  <SelectItem value="1-year">1-Year Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newCycle.startDate}
                  onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                  className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newCycle.endDate}
                  onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                  className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={newCycle.status}
                onValueChange={(value) => setNewCycle({ ...newCycle, status: value })}
              >
                <SelectTrigger className="border-[#00C2FF]/30 focus:border-[#00C2FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#00C2FF]/20">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateCycleOpen(false)}
              className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCycle}
              className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white"
            >
              Create Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Reviewers Dialog */}
      <Dialog open={isAssignReviewersOpen} onOpenChange={setIsAssignReviewersOpen}>
        <DialogContent className="border-[#00C2FF]/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              Assign Reviewers
            </DialogTitle>
            <DialogDescription>
              Assign peer, client, or manager reviewers to an employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Review Cycle *</Label>
              <Select
                value={assignmentForm.cycleId}
                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, cycleId: value })}
              >
                <SelectTrigger className="border-[#00C2FF]/30 focus:border-[#00C2FF]">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent className="border-[#00C2FF]/20">
                  {cycles.filter(c => c.status === "active" || c.status === "draft").map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employee to Review *</Label>
              <Select
                value={assignmentForm.employeeId}
                onValueChange={(value) => setAssignmentForm({ ...assignmentForm, employeeId: value })}
              >
                <SelectTrigger className="border-[#00C2FF]/30 focus:border-[#00C2FF]">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="border-[#00C2FF]/20">
                  {users.filter(u => u.role === "employee" || u.role === "intern").map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Add Reviewers</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-[#00C2FF]/20 rounded-lg p-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={assignmentForm.reviewerIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignmentForm({
                            ...assignmentForm,
                            reviewerIds: [...assignmentForm.reviewerIds, user.id],
                            reviewerTypes: {
                              ...assignmentForm.reviewerTypes,
                              [user.id]: user.id === assignmentForm.employeeId ? "self" : "peer",
                            },
                          })
                        } else {
                          const newReviewerTypes = { ...assignmentForm.reviewerTypes }
                          delete newReviewerTypes[user.id]
                          setAssignmentForm({
                            ...assignmentForm,
                            reviewerIds: assignmentForm.reviewerIds.filter(id => id !== user.id),
                            reviewerTypes: newReviewerTypes,
                          })
                        }
                      }}
                      className="rounded border-[#00C2FF]/30"
                    />
                    <span className="flex-1">{user.name} ({user.email})</span>
                    {assignmentForm.reviewerIds.includes(user.id) && (
                      <Select
                        value={assignmentForm.reviewerTypes[user.id] || "peer"}
                        onValueChange={(value) => {
                          setAssignmentForm({
                            ...assignmentForm,
                            reviewerTypes: {
                              ...assignmentForm.reviewerTypes,
                              [user.id]: value,
                            },
                          })
                        }}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs border-[#00C2FF]/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-[#00C2FF]/20">
                          <SelectItem value="self">Self</SelectItem>
                          <SelectItem value="peer">Peer</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignReviewersOpen(false)
                setAssignmentForm({
                  cycleId: "",
                  employeeId: "",
                  reviewerIds: [],
                  reviewerTypes: {},
                })
              }}
              className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignReviewers}
              className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white"
            >
              Assign Reviewers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Form Details Dialog */}
      <Dialog open={isViewFormOpen} onOpenChange={setIsViewFormOpen}>
        <DialogContent className="border-[#00C2FF]/20 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              Review Details
            </DialogTitle>
            <DialogDescription>
              Complete review response from {selectedForm?.reviewer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Reviewer:</span>
                  <p className="font-semibold">{selectedForm.reviewer?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedForm.reviewer?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Employee:</span>
                  <p className="font-semibold">{selectedForm.employee?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedForm.employee?.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Review Type:</span>
                  <div className="mt-1">
                    <Badge className={`${getReviewerTypeColor(selectedForm.reviewerType)} text-white`}>
                      {selectedForm.reviewerType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Overall Rating:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-2xl font-bold text-[#00C2FF]">{selectedForm.overallRating || "N/A"}</span>
                    {selectedForm.overallRating && <span className="text-sm text-muted-foreground">/5</span>}
                  </div>
                </div>
              </div>

              {selectedForm.kpiScores && (
                <div>
                  <h3 className="font-semibold mb-3">KPI Scores</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(JSON.parse(selectedForm.kpiScores as any)).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{key}</span>
                        <span className="text-lg font-bold text-[#00C2FF]">{value as number}/5</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedForm.goalsAchievement && (
                <div>
                  <h3 className="font-semibold mb-2">Goals Achievement</h3>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedForm.goalsAchievement}</p>
                </div>
              )}

              {selectedForm.strengths && (
                <div>
                  <h3 className="font-semibold mb-2">Strengths</h3>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedForm.strengths}</p>
                </div>
              )}

              {selectedForm.improvements && (
                <div>
                  <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedForm.improvements}</p>
                </div>
              )}

              {selectedForm.additionalComments && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Comments</h3>
                  <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedForm.additionalComments}</p>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground pt-4 border-t">
                <span>Submitted: {selectedForm.submittedAt ? new Date(selectedForm.submittedAt).toLocaleString() : "N/A"}</span>
                <span>Cycle: {selectedForm.cycle?.name || `Cycle ${selectedForm.cycleId}`}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewFormOpen(false)}
              className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}