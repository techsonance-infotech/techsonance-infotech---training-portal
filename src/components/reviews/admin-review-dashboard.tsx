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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Calendar,
  Users,
  FileText,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Eye,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
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
  formsByType: Record<string, number>
  formsByStatus: Record<string, number>
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Assignment {
  id: number
  employeeId: string
  reviewerId: string
  reviewerType: string
  status: string
  employee: User | null
  reviewer: User | null
}

export function AdminReviewDashboard() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null)
  
  // Dialog states
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false)
  const [isAssignReviewersOpen, setIsAssignReviewersOpen] = useState(false)
  const [isEditCycleOpen, setIsEditCycleOpen] = useState(false)
  
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAssignments = async (cycleId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/cycles/${cycleId}/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch assignments")
      const data = await response.json()
      setAssignments(data)
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    // Create assignments array
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
      fetchStats()
    } catch (error: any) {
      toast.error(error.message || "Failed to assign reviewers")
    }
  }

  const handleExportCycle = async (cycleId: number) => {
    try {
      const token = localStorage.getItem("bearer_token")
      const response = await fetch(`/api/reviews/export/${cycleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      default: return "bg-gray-400"
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

      {/* Review Cycles Table */}
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
    </div>
  )
}
