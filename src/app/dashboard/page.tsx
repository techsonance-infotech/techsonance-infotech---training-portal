"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner, PageLoader } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, Calendar, CheckCircle2, Clock, FileText, TrendingUp, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CourseAssignment {
  id: number
  courseId: number
  userId: number
  progress: number
  status: string
  assignedAt: string
  completedAt: string | null
}

interface Course {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
}

interface Activity {
  id: number
  courseId: number
  title: string
  type: string
  description: string
  scheduledDate: string
}

interface Policy {
  id: number
  title: string
  description: string
  required: boolean
  content?: string
}

export default function EmployeeDashboard() {
  const [assignments, setAssignments] = useState<(CourseAssignment & { course?: Course })[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredPolicy, setHoveredPolicy] = useState<Policy | null>(null)
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch assignments - in real app, filter by current user
      const assignmentsRes = await fetch("/api/assignments")
      const assignmentsData = await assignmentsRes.json()

      // Fetch course details for each assignment
      const assignmentsWithCourses = await Promise.all(
        assignmentsData.slice(0, 5).map(async (assignment: CourseAssignment) => {
          try {
            const courseRes = await fetch(`/api/courses/${assignment.courseId}`)
            const courseData = await courseRes.json()
            return { ...assignment, course: courseData }
          } catch {
            return assignment
          }
        })
      )

      setAssignments(assignmentsWithCourses)

      // Fetch upcoming activities
      const coursesRes = await fetch("/api/courses?limit=3")
      const coursesData = await coursesRes.json()
      
      if (coursesData.length > 0) {
        const activitiesRes = await fetch(`/api/courses/${coursesData[0].id}/activities`)
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.slice(0, 5))
      }

      // Fetch policies
      const policiesRes = await fetch("/api/policies?limit=6")
      const policiesData = await policiesRes.json()
      setPolicies(policiesData)
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePolicyHover = (policy: Policy) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
    
    // Set a small delay before showing the dialog
    const timeout = setTimeout(() => {
      setHoveredPolicy(policy)
      setIsPolicyDialogOpen(true)
    }, 300)
    
    setHoverTimeout(timeout)
  }

  const handlePolicyLeave = () => {
    // Clear the timeout if mouse leaves before dialog opens
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  const handleDialogClose = () => {
    setIsPolicyDialogOpen(false)
    setHoveredPolicy(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "not_started":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in_progress":
        return "In Progress"
      case "not_started":
        return "Not Started"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="employee">
        <PageLoader text="Loading dashboard..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="employee">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {assignments.filter((a) => a.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {assignments.filter((a) => a.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Courses finished</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Activities</CardTitle>
              <Calendar className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {activities.length}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled events</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policies</CardTitle>
              <FileText className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {policies.length}
              </div>
              <p className="text-xs text-muted-foreground">To complete</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* My Courses */}
          <Card className="col-span-1 border-[#00C2FF]/20 animate-in fade-in slide-in-from-left duration-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">My Courses</CardTitle>
                  <CardDescription>Your assigned training programs</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
                  <Link href="/dashboard/courses">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Loading courses..." />
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="space-y-2 p-3 rounded-lg border border-[#00C2FF]/10 hover:border-[#00C2FF]/30 transition-all duration-300 hover:bg-[#00C2FF]/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {assignment.course?.title || "Course"}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {assignment.course?.description}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(assignment.status)} text-white border-none`}>
                          {getStatusLabel(assignment.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span className="text-[#00C2FF] font-medium">{assignment.progress}%</span>
                        </div>
                        <div className="h-2 bg-[#0A1A2F]/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] transition-all duration-500"
                            style={{ width: `${assignment.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card className="col-span-1 border-[#00C2FF]/20 animate-in fade-in slide-in-from-right duration-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Upcoming Activities</CardTitle>
                  <CardDescription>Scheduled sessions and events</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
                  <Link href="/dashboard/courses">View Calendar</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Loading activities..." />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming activities</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent hover:from-[#00C2FF]/10 hover:to-[#00C2FF]/10 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-2 rounded-lg">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(activity.scheduledDate)}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs border-[#00C2FF]/30">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Company Policies */}
        <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Company Policies</CardTitle>
                <CardDescription>Required training and compliance materials</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
                <Link href="/policies">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" text="Loading policies..." />
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No policies available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {policies.map((policy) => (
                  <Card 
                    key={policy.id} 
                    className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 cursor-pointer"
                    onMouseEnter={() => handlePolicyHover(policy)}
                    onMouseLeave={handlePolicyLeave}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <FileText className="h-5 w-5 text-[#00C2FF]" />
                        {policy.required && (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-700 text-white border-none text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mt-2">{policy.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {policy.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 cursor-pointer group animate-in fade-in zoom-in duration-500">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base">Browse Courses</CardTitle>
                  <CardDescription className="text-xs">
                    Explore available training
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 cursor-pointer group animate-in fade-in zoom-in duration-500 delay-100" asChild>
            <Link href="/portfolio">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">My Portfolio</CardTitle>
                    <CardDescription className="text-xs">
                      Build your profile
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Policy Detail Dialog */}
        <Dialog open={isPolicyDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent 
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{hoveredPolicy?.title}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {hoveredPolicy?.description}
                  </DialogDescription>
                </div>
                {hoveredPolicy?.required && (
                  <Badge variant="destructive" className="ml-2">
                    Required
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {hoveredPolicy?.content || "No content available"}
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/policies">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Policies
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}