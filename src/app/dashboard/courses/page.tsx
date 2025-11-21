"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loading-spinner"
import { BookOpen, Search, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
}

interface Assignment {
  id: number
  courseId: number
  userId: number
  progress: number
  status: string
}

export default function EmployeeCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCourses()
    fetchAssignments()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses?limit=100")
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      toast.error("Failed to load courses")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments")
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      console.error("Failed to load assignments")
    }
  }

  const handleCourseClick = (courseId: number) => {
    router.push(`/dashboard/courses/${courseId}`)
  }

  const getCourseProgress = (courseId: number) => {
    const assignment = assignments.find(a => a.courseId === courseId)
    return assignment?.progress || 0
  }

  const getCourseStatus = (courseId: number) => {
    const assignment = assignments.find(a => a.courseId === courseId)
    return assignment?.status || "not_started"
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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

  if (isLoading) {
    return (
      <DashboardLayout userRole="employee">
        <PageLoader text="Loading courses..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              My Courses
            </h1>
            <p className="text-muted-foreground">
              Browse and access your training courses
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="border-[#00C2FF]/20">
            <CardContent className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No courses found" : "No courses available"}
              </h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Courses will appear here when assigned"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const progress = getCourseProgress(course.id)
              const status = getCourseStatus(course.id)

              return (
                <Card
                  key={course.id}
                  className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <BookOpen className="h-8 w-8 text-[#00C2FF] group-hover:scale-110 transition-transform" />
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(status)} text-white border-none`}
                      >
                        {getStatusLabel(status)}
                      </Badge>
                    </div>
                    <CardTitle className="group-hover:text-[#00C2FF] transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(course.startDate)}</span>
                      <span>•</span>
                      <span>{formatDate(course.endDate)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-[#00C2FF] font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-[#0A1A2F]/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all"
                    >
                      View Course
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}