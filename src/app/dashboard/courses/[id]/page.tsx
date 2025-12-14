"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ArrowLeft, BookOpen, Calendar, Clock, Video, FileText, ExternalLink, ListTree } from "lucide-react"
import Link from "next/link"
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
  subtopics: Topic[]
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

export default function CourseViewPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const updateAssignmentStatus = async (newStatus: string, newProgress: number) => {
    try {
      const method = assignment ? 'PUT' : 'POST';
      const response = await fetch('/api/assignments', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseId,
          status: newStatus,
          progress: newProgress
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedAssignment = await response.json();
      setAssignment(updatedAssignment);
      toast.success(newStatus === 'completed' ? 'Course completed!' : 'Course started');

      // Refresh dashboard data context if needed (optional)
    } catch (error) {
      toast.error('Failed to update course progress');
    }
  }

  const fetchCourseData = async () => {
    try {
      const [courseRes, topicsRes, activitiesRes, assignmentsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/topics`),
        fetch(`/api/courses/${courseId}/activities`),
        fetch(`/api/assignments`),
      ])

      const courseData = await courseRes.json()
      const topicsData = await topicsRes.json()
      const activitiesData = await activitiesRes.json()
      const assignmentsData = await assignmentsRes.json()

      setCourse(courseData)
      setTopics(topicsData)
      setActivities(activitiesData)

      const courseAssignment = assignmentsData.find((a: Assignment) => a.courseId === parseInt(courseId))
      setAssignment(courseAssignment || null)
    } catch (error) {
      toast.error("Failed to load course details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderTopicNumber = (index: number, parentNumber: string = ""): string => {
    return parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`
  }

  const renderTopicsHierarchy = (topicList: Topic[], level: number = 0, parentNumber: string = "") => {
    return topicList.map((topic, index) => {
      const topicNumber = renderTopicNumber(index, parentNumber)
      const hasSubtopics = topic.subtopics && topic.subtopics.length > 0

      return (
        <AccordionItem
          key={topic.id}
          value={`topic-${topic.id}`}
          className={`border border-[#00C2FF]/20 rounded-lg px-4 ${level > 0 ? 'ml-6 border-l-2 border-primary/30' : ''}`}
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left flex-1">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-semibold text-sm min-w-[3rem] text-center">
                {topicNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{topic.title}</h4>
                  {level > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Subtopic
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {topic.videoUrl && (
                    <Badge variant="secondary" className="text-xs">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  {topic.attachmentUrl && (
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Attachment
                    </Badge>
                  )}
                  {hasSubtopics && (
                    <Badge variant="secondary" className="text-xs">
                      {topic.subtopics.length} subtopic{topic.subtopics.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-4">
            <div
              className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleTopicClick(topic)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div
                    className="text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: topic.content }}
                  />
                </div>
                <Button variant="ghost" size="sm" className="ml-4">
                  View Full
                </Button>
              </div>
            </div>

            {hasSubtopics && (
              <div className="space-y-2 mt-4">
                <Accordion type="multiple" className="space-y-2">
                  {renderTopicsHierarchy(topic.subtopics, level + 1, topicNumber)}
                </Accordion>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      )
    })
  }

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
        <PageLoader text="Loading course..." />
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout userRole="employee">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button asChild>
            <Link href="/dashboard/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/courses">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-[#00C2FF]" />
                {course.title}
              </h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {assignment && (
              <Badge
                variant="outline"
                className={`${getStatusColor(assignment.status)} text-white border-none`}
              >
                {getStatusLabel(assignment.status)}
              </Badge>
            )}

            {(!assignment || assignment.status === 'not_started') && (
              <Button
                onClick={() => updateAssignmentStatus('in_progress', 10)}
                className="bg-[#00C2FF] hover:bg-[#00C2FF]/90 text-white"
              >
                Start Learning
              </Button>
            )}

            {assignment?.status === 'in_progress' && (
              <Button
                onClick={() => updateAssignmentStatus('completed', 100)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark as Completed
              </Button>
            )}
          </div>
        </div>

        {/* Course Info Card */}
        <Card className="border-[#00C2FF]/20">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-semibold">{formatDate(course.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="font-semibold">{formatDate(course.endDate)}</p>
              </div>
              {assignment && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#0A1A2F]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] transition-all duration-500"
                        style={{ width: `${assignment.progress}%` }}
                      />
                    </div>
                    <span className="text-[#00C2FF] font-semibold">{assignment.progress}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Topics and Activities Tabs */}
        <Tabs defaultValue="topics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topics">
              <ListTree className="h-4 w-4 mr-2" />
              Topics ({topics.length})
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Calendar className="h-4 w-4 mr-2" />
              Activities ({activities.length})
            </TabsTrigger>
          </TabsList>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-4">
            {selectedTopic ? (
              // Topic Detail View
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTopic(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Topics
                </Button>
                <Card className="border-[#00C2FF]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-[#00C2FF]" />
                      {selectedTopic.title}
                    </CardTitle>
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
            ) : topics.length === 0 ? (
              <Card className="border-[#00C2FF]/20">
                <CardContent className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No topics available yet</p>
                </CardContent>
              </Card>
            ) : (
              // Topics List with Hierarchy
              <Accordion type="multiple" className="space-y-3">
                {renderTopicsHierarchy(topics)}
              </Accordion>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            {activities.length === 0 ? (
              <Card className="border-[#00C2FF]/20">
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities scheduled yet</p>
                </CardContent>
              </Card>
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
      </div>
    </DashboardLayout>
  )
}
