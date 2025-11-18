"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLoader } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { ArrowLeft, Save, Plus, Trash2, Calendar, BookOpen, Clock } from "lucide-react"
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
}

interface Activity {
  id: number
  courseId: number
  title: string
  type: string
  description: string
  scheduledDate: string
}

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const isNew = courseId === "new"

  const [course, setCourse] = useState<Course>({
    id: 0,
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })
  const [topics, setTopics] = useState<Topic[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)

  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    videoUrl: "",
    attachmentUrl: "",
    orderIndex: 0,
  })

  const [newActivity, setNewActivity] = useState({
    title: "",
    type: "overview",
    description: "",
    scheduledDate: "",
  })

  useEffect(() => {
    if (!isNew) {
      fetchCourse()
      fetchTopics()
      fetchActivities()
    }
  }, [courseId, isNew])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      const data = await response.json()
      setCourse(data)
    } catch (error) {
      toast.error("Failed to load course")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTopics = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/topics`)
      const data = await response.json()
      setTopics(data)
    } catch (error) {
      console.error("Failed to load topics")
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/activities`)
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error("Failed to load activities")
    }
  }

  const handleSaveCourse = async () => {
    if (!course.title.trim() || !course.description.trim() || !course.startDate || !course.endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      const url = isNew ? "/api/courses" : `/api/courses/${courseId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          startDate: course.startDate,
          endDate: course.endDate,
          createdBy: 1, // Admin user ID
        }),
      })

      if (!response.ok) throw new Error("Failed to save course")

      const data = await response.json()
      toast.success(isNew ? "Course created successfully" : "Course updated successfully")

      if (isNew) {
        router.push(`/admin/courses/${data.id}`)
      }
    } catch (error) {
      toast.error("Failed to save course")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast.error("Please fill in required fields")
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newTopic,
          orderIndex: topics.length,
        }),
      })

      if (!response.ok) throw new Error("Failed to add topic")

      const data = await response.json()
      setTopics([...topics, data])
      setNewTopic({ title: "", content: "", videoUrl: "", attachmentUrl: "", orderIndex: 0 })
      setIsTopicDialogOpen(false)
      toast.success("Topic added successfully")
    } catch (error) {
      toast.error("Failed to add topic")
    }
  }

  const handleAddActivity = async () => {
    if (!newActivity.title.trim() || !newActivity.description.trim() || !newActivity.scheduledDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newActivity),
      })

      if (!response.ok) throw new Error("Failed to add activity")

      const data = await response.json()
      setActivities([...activities, data])
      setNewActivity({ title: "", type: "overview", description: "", scheduledDate: "" })
      setIsActivityDialogOpen(false)
      toast.success("Activity added successfully")
    } catch (error) {
      toast.error("Failed to add activity")
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin">
        <PageLoader text={isNew ? "Setting up..." : "Loading course..."} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/courses">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isNew ? "Create Course" : "Edit Course"}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? "Add a new training course" : "Update course details"}
              </p>
            </div>
          </div>
          <Button onClick={handleSaveCourse} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Course"}
          </Button>
        </div>

        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Basic details about the training course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced React Development"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this course..."
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={course.startDate}
                  onChange={(e) => setCourse({ ...course, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={course.endDate}
                  onChange={(e) => setCourse({ ...course, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics and Activities - Only show for existing courses */}
        {!isNew && (
          <Tabs defaultValue="topics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            {/* Topics Tab */}
            <TabsContent value="topics">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Course Topics</CardTitle>
                      <CardDescription>Learning materials and content</CardDescription>
                    </div>
                    <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Topic
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Topic</DialogTitle>
                          <DialogDescription>
                            Create a new learning topic for this course
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="topicTitle">Title *</Label>
                            <Input
                              id="topicTitle"
                              placeholder="e.g., Introduction to Hooks"
                              value={newTopic.title}
                              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="topicContent">Content *</Label>
                            <Textarea
                              id="topicContent"
                              placeholder="Topic content and learning materials..."
                              value={newTopic.content}
                              onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                            <Input
                              id="videoUrl"
                              placeholder="https://..."
                              value={newTopic.videoUrl}
                              onChange={(e) => setNewTopic({ ...newTopic, videoUrl: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="attachmentUrl">Attachment URL (Optional)</Label>
                            <Input
                              id="attachmentUrl"
                              placeholder="https://..."
                              value={newTopic.attachmentUrl}
                              onChange={(e) =>
                                setNewTopic({ ...newTopic, attachmentUrl: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTopicDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddTopic}>Add Topic</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {topics.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                      <p className="mb-4">Add topics to structure your course content</p>
                      <Button onClick={() => setIsTopicDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Topic
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topics.map((topic, index) => (
                        <div
                          key={topic.id}
                          className="flex items-start justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{topic.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {topic.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {topic.videoUrl && (
                                  <Badge variant="outline">Video</Badge>
                                )}
                                {topic.attachmentUrl && (
                                  <Badge variant="outline">Attachment</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Course Activities</CardTitle>
                      <CardDescription>Scheduled sessions and events</CardDescription>
                    </div>
                    <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Activity</DialogTitle>
                          <DialogDescription>
                            Schedule a new activity for this course
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="activityTitle">Title *</Label>
                            <Input
                              id="activityTitle"
                              placeholder="e.g., Overview Session"
                              value={newActivity.title}
                              onChange={(e) =>
                                setNewActivity({ ...newActivity, title: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityType">Type *</Label>
                            <Select
                              value={newActivity.type}
                              onValueChange={(value) =>
                                setNewActivity({ ...newActivity, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="discussion">Discussion</SelectItem>
                                <SelectItem value="practical">Practical</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityDescription">Description *</Label>
                            <Textarea
                              id="activityDescription"
                              placeholder="Activity details..."
                              value={newActivity.description}
                              onChange={(e) =>
                                setNewActivity({ ...newActivity, description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
                            <Input
                              id="scheduledDate"
                              type="datetime-local"
                              value={newActivity.scheduledDate}
                              onChange={(e) =>
                                setNewActivity({ ...newActivity, scheduledDate: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsActivityDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddActivity}>Add Activity</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                      <p className="mb-4">Schedule activities and sessions for this course</p>
                      <Button onClick={() => setIsActivityDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Activity
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{activity.title}</h4>
                                <Badge variant="outline">{activity.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {formatDateTime(activity.scheduledDate)}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}