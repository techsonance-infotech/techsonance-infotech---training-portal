"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageLoader } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BookOpen, Search, Calendar, Clock, Video, FileText, ChevronRight, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
}

interface Topic {
  id: number
  courseId: number
  title: string
  content: string
  videoUrl: string | null
  attachmentUrl: string | null
  orderIndex: number
  parentTopicId: number | null
  orderNumber: number
}

interface Activity {
  id: number
  courseId: number
  title: string
  type: string
  description: string
  scheduledDate: string
}

interface Assignment {
  id: number
  courseId: number
  userId: number
  progress: number
  status: string
}

export default function EmployeeCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

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

  const fetchCourseDetails = async (courseId: number) => {
    try {
      const [topicsRes, activitiesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/topics`),
        fetch(`/api/courses/${courseId}/activities`),
      ])
      const topicsData = await topicsRes.json()
      const activitiesData = await activitiesRes.json()
      setTopics(topicsData)
      setActivities(activitiesData)
    } catch (error) {
      toast.error("Failed to load course details")
    }
  }

  const handleCourseClick = async (course: Course) => {
    setSelectedCourse(course)
    setIsDialogOpen(true)
    await fetchCourseDetails(course.id)
  }

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic)
  }

  const getTopicHierarchy = () => {
    const mainTopics = topics.filter(t => !t.parentTopicId).sort((a, b) => a.orderNumber - b.orderNumber)
    return mainTopics.map(mainTopic => ({
      ...mainTopic,
      subtopics: topics
        .filter(t => t.parentTopicId === mainTopic.id)
        .sort((a, b) => a.orderNumber - b.orderNumber)
    }))
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
              const startDate = new Date(course.startDate)
              const endDate = new Date(course.endDate)
              const now = new Date()
              const isActive = now >= startDate && now <= endDate

              return (
                <Card
                  key={course.id}
                  className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => handleCourseClick(course)}
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

        {/* Course Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCourse?.title}</DialogTitle>
              <DialogDescription>
                {selectedCourse?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedCourse && (
              <Tabs defaultValue="topics" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
                  <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
                </TabsList>

                {/* Topics Tab */}
                <TabsContent value="topics" className="space-y-4 mt-4">
                  {topics.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No topics available yet</p>
                    </div>
                  ) : selectedTopic ? (
                    // Topic Detail View
                    <div className="space-y-4">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedTopic(null)}
                        className="mb-4"
                      >
                        ← Back to Topics
                      </Button>
                      <Card className="border-[#00C2FF]/20">
                        <CardHeader>
                          <CardTitle>{selectedTopic.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: selectedTopic.content }}
                          />
                          {(selectedTopic.videoUrl || selectedTopic.attachmentUrl) && (
                            <div className="flex gap-2 pt-4 border-t">
                              {selectedTopic.videoUrl && (
                                <Button variant="outline" asChild>
                                  <a href={selectedTopic.videoUrl} target="_blank" rel="noopener noreferrer">
                                    <Video className="h-4 w-4 mr-2" />
                                    Watch Video
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                  </a>
                                </Button>
                              )}
                              {selectedTopic.attachmentUrl && (
                                <Button variant="outline" asChild>
                                  <a href={selectedTopic.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Attachment
                                    <ExternalLink className="h-3 w-3 ml-2" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Topics List with Hierarchy
                    <Accordion type="single" collapsible className="space-y-2">
                      {getTopicHierarchy().map((topic) => (
                        <AccordionItem
                          key={topic.id}
                          value={`topic-${topic.id}`}
                          className="border border-[#00C2FF]/20 rounded-lg px-4"
                        >
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-semibold text-sm">
                                {topic.orderNumber}
                              </div>
                              <div>
                                <h4 className="font-semibold">{topic.title}</h4>
                                {topic.subtopics.length > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2 pt-4">
                            {/* Main Topic Content Preview */}
                            <div
                              className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => handleTopicClick(topic)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div 
                                    className="text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: topic.content }}
                                  />
                                  <div className="flex items-center gap-2 mt-2">
                                    {topic.videoUrl && (
                                      <Badge variant="outline" className="text-xs">
                                        <Video className="h-3 w-3 mr-1" />
                                        Video
                                      </Badge>
                                    )}
                                    {topic.attachmentUrl && (
                                      <Badge variant="outline" className="text-xs">
                                        <FileText className="h-3 w-3 mr-1" />
                                        Attachment
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>

                            {/* Subtopics */}
                            {topic.subtopics.length > 0 && (
                              <div className="ml-4 space-y-2 border-l-2 border-primary/20 pl-4">
                                {topic.subtopics.map((subtopic) => (
                                  <div
                                    key={subtopic.id}
                                    className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleTopicClick(subtopic)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                                          {topic.orderNumber}.{subtopic.orderNumber}
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-medium text-sm">{subtopic.title}</h5>
                                          <div className="flex items-center gap-2 mt-1">
                                            {subtopic.videoUrl && (
                                              <Badge variant="outline" className="text-xs">
                                                <Video className="h-3 w-3 mr-1" />
                                                Video
                                              </Badge>
                                            )}
                                            {subtopic.attachmentUrl && (
                                              <Badge variant="outline" className="text-xs">
                                                <FileText className="h-3 w-3 mr-1" />
                                                Attachment
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>

                {/* Activities Tab */}
                <TabsContent value="activities" className="space-y-4 mt-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activities scheduled yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <Card key={activity.id} className="border-[#00C2FF]/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-2 rounded-lg">
                                <Clock className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{activity.title}</h4>
                                  <Badge variant="outline" className="border-[#00C2FF]/30">
                                    {activity.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {formatDateTime(activity.scheduledDate)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
