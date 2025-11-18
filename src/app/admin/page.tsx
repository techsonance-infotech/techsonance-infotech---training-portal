"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner, PageLoader } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Plus,
  BarChart3,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Course {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
}

interface Policy {
  id: number
  title: string
  required: boolean
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [coursesRes, policiesRes] = await Promise.all([
        fetch("/api/courses?limit=10"),
        fetch("/api/policies?limit=10"),
      ])

      const coursesData = await coursesRes.json()
      const policiesData = await policiesRes.json()

      setCourses(coursesData)
      setPolicies(policiesData)
    } catch (error) {
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for charts
  const enrollmentData = [
    { name: ".NET Track", students: 45 },
    { name: "Java Track", students: 38 },
    { name: "Web Track", students: 52 },
    { name: "Cloud Track", students: 41 },
    { name: "React", students: 48 },
    { name: "Data Science", students: 35 },
  ]

  const completionData = [
    { name: "Completed", value: 68, color: "#00C2FF" },
    { name: "In Progress", value: 24, color: "#0A1A2F" },
    { name: "Not Started", value: 8, color: "#94a3b8" },
  ]

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <PageLoader text="Loading admin dashboard..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {courses.length}
              </div>
              <p className="text-xs text-muted-foreground">Active training programs</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500 delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">156</div>
              <p className="text-xs text-muted-foreground">Employees & Interns</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">68%</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 animate-in fade-in zoom-in duration-500 delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <FileText className="h-4 w-4 text-[#00C2FF]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                {policies.length}
              </div>
              <p className="text-xs text-muted-foreground">Company policies</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-left duration-700">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Course Enrollments</CardTitle>
              <CardDescription>Number of students per course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#00C2FF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-right duration-700">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Course Completion Status</CardTitle>
              <CardDescription>Overall progress distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="courses" className="space-y-4 animate-in fade-in slide-in-from-bottom duration-700">
          <TabsList className="bg-gradient-to-r from-[#00C2FF]/10 to-[#0A1A2F]/10 border border-[#00C2FF]/20">
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">Courses</TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">Policies</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C2FF] data-[state=active]:to-[#0A1A2F] data-[state=active]:text-white">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <Card className="border-[#00C2FF]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Course Management</CardTitle>
                    <CardDescription>Create and manage training programs</CardDescription>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                    <Link href="/admin/courses/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading courses..." />
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                    <p className="text-lg font-medium bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">No courses yet</p>
                    <p className="text-sm">Create your first course to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-[#00C2FF]/20 bg-gradient-to-r from-transparent via-[#00C2FF]/5 to-transparent hover:from-[#00C2FF]/10 hover:to-[#00C2FF]/10 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-2 rounded-lg">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{course.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {course.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs border-[#00C2FF]/30">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(course.startDate).toLocaleDateString()} -{" "}
                                  {new Date(course.endDate).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
                          <Link href={`/admin/courses/${course.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card className="border-[#00C2FF]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Policy Management</CardTitle>
                    <CardDescription>Manage company policies and training</CardDescription>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                    <Link href="/admin/policies/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Policy
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading policies..." />
                  </div>
                ) : policies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
                    <p className="text-lg font-medium bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">No policies yet</p>
                    <p className="text-sm">Add company policies and training materials</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {policies.map((policy) => (
                      <Card key={policy.id} className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1">
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
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" size="sm" className="w-full border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300" asChild>
                            <Link href={`/admin/policies/${policy.id}`}>Edit</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-[#00C2FF]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">User Management</CardTitle>
                    <CardDescription>Manage employees and interns</CardDescription>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                    <Link href="/admin/users">
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] flex items-center justify-center animate-pulse">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-medium bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Click "Manage Users" to access full user management</p>
                  <p className="text-sm text-muted-foreground mt-2">Create, edit, and delete employee accounts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 cursor-pointer group animate-in fade-in zoom-in duration-500" asChild>
            <Link href="/admin/courses">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manage Courses</CardTitle>
                    <CardDescription className="text-xs">
                      Full CRUD operations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 cursor-pointer group animate-in fade-in zoom-in duration-500 delay-100" asChild>
            <Link href="/admin/policies">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manage Policies</CardTitle>
                    <CardDescription className="text-xs">
                      Update company policies
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 cursor-pointer group animate-in fade-in zoom-in duration-500 delay-200" asChild>
            <Link href="/admin/users">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manage Users</CardTitle>
                    <CardDescription className="text-xs">
                      Employee management
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}