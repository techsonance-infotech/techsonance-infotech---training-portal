"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageLoader } from "@/components/ui/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { ArrowLeft, Save, Plus, Trash2, Calendar, BookOpen, Clock, Edit, ChevronRight, ListTree } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

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
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [parentTopicForSubtopic, setParentTopicForSubtopic] = useState<number | null>(null)

  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    videoUrl: "",
    attachmentUrl: "",
    orderIndex: 0,
    orderNumber: 0,
    parentTopicId: null as number | null,
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

  // Scroll to tabs section when hash changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'topics' || hash === 'activities') {
        setTimeout(() => {
          const element = document.querySelector(`[value="${hash}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Trigger the tab
            const tabsTrigger = element as HTMLButtonElement
            tabsTrigger.click()
          }
        }, 100)
      }
    }
  }, [])

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
          createdBy: 1,
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

  const openTopicDialog = (parentTopic?: Topic) => {
    if (parentTopic) {
      setParentTopicForSubtopic(parentTopic.id)
      setNewTopic({
        title: "",
        content: "",
        videoUrl: "",
        attachmentUrl: "",
        orderIndex: 0,
        orderNumber: countAllTopics(topics) + 1,
        parentTopicId: parentTopic.id,
      })
    } else {
      setParentTopicForSubtopic(null)
      setNewTopic({
        title: "",
        content: "",
        videoUrl: "",
        attachmentUrl: "",
        orderIndex: topics.length,
        orderNumber: countAllTopics(topics) + 1,
        parentTopicId: null,
      })
    }
    setEditingTopic(null)
    setIsTopicDialogOpen(true)
  }

  const openEditTopicDialog = (topic: Topic) => {
    setEditingTopic(topic)
    setNewTopic({
      title: topic.title,
      content: topic.content,
      videoUrl: topic.videoUrl || "",
      attachmentUrl: topic.attachmentUrl || "",
      orderIndex: topic.orderIndex,
      orderNumber: topic.orderNumber,
      parentTopicId: topic.parentTopicId,
    })
    setParentTopicForSubtopic(topic.parentTopicId)
    setIsTopicDialogOpen(true)
  }

  const countAllTopics = (topicList: Topic[]): number => {
    let count = topicList.length
    topicList.forEach(topic => {
      count += countAllTopics(topic.subtopics)
    })
    return count
  }

  const handleSaveTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast.error("Please fill in title and content")
      return
    }

    try {
      if (editingTopic) {
        // Update existing topic
        const response = await fetch(`/api/topics/${editingTopic.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTopic.title,
            content: newTopic.content,
            videoUrl: newTopic.videoUrl || null,
            attachmentUrl: newTopic.attachmentUrl || null,
            orderIndex: newTopic.orderIndex,
            orderNumber: newTopic.orderNumber,
            parentTopicId: newTopic.parentTopicId,
          }),
        })

        if (!response.ok) throw new Error("Failed to update topic")
        toast.success("Topic updated successfully")
      } else {
        // Create new topic
        const response = await fetch(`/api/courses/${courseId}/topics`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTopic),
        })

        if (!response.ok) throw new Error("Failed to add topic")
        toast.success(parentTopicForSubtopic ? "Subtopic added successfully" : "Topic added successfully")
      }

      fetchTopics()
      setIsTopicDialogOpen(false)
      setEditingTopic(null)
      setParentTopicForSubtopic(null)
      setNewTopic({ 
        title: "", 
        content: "", 
        videoUrl: "", 
        attachmentUrl: "", 
        orderIndex: 0, 
        orderNumber: 0,
        parentTopicId: null,
      })
    } catch (error) {
      toast.error(editingTopic ? "Failed to update topic" : "Failed to add topic")
    }
  }

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("Delete this topic and all its subtopics?")) return

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete topic")

      const data = await response.json()
      toast.success(`Deleted ${data.deletedCount} topic(s) successfully`)
      fetchTopics()
    } catch (error) {
      toast.error("Failed to delete topic")
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

  const renderTopicNumber = (topic: Topic, parentNumber: string = ""): string => {
    const currentNumber = parentNumber ? `${parentNumber}.${topic.orderNumber}` : `${topic.orderNumber}`
    return currentNumber
  }

  const renderTopicsHierarchy = (topicList: Topic[], level: number = 0, parentNumber: string = "") => {
    return topicList.map((topic, index) => {
      const topicNumber = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`
      
      return (
        <div key={topic.id} className={`${level > 0 ? 'ml-8' : ''}`}>
          <div className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-semibold text-sm min-w-[3rem] text-center">
                {topicNumber}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold flex items-center gap-2">
                  {topic.title}
                  {level > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Subtopic
                    </Badge>
                  )}
                </h4>
                <div 
                  className="text-sm text-muted-foreground mt-1 line-clamp-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: topic.content }}
                />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {topic.videoUrl && (
                    <Badge variant="outline" className="text-xs">Video</Badge>
                  )}
                  {topic.attachmentUrl && (
                    <Badge variant="outline" className="text-xs">Attachment</Badge>
                  )}
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {topic.subtopics.length} subtopic{topic.subtopics.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openTopicDialog(topic)}
                title="Add subtopic"
              >
                <Plus className="h-4 w-4 mr-1" />
                Sub
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditTopicDialog(topic)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteTopic(topic.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className="mt-2 space-y-2">
              {renderTopicsHierarchy(topic.subtopics, level + 1, topicNumber)}
            </div>
          )}
        </div>
      )
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

        {/* Topics and Activities */}
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
                      <CardTitle className="flex items-center gap-2">
                        <ListTree className="h-5 w-5" />
                        Course Topics
                      </CardTitle>
                      <CardDescription>Learning materials with hierarchical structure (topics and subtopics)</CardDescription>
                    </div>
                    <Button onClick={() => openTopicDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Topic
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {topics.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                      <p className="mb-4">Add topics to structure your course content</p>
                      <Button onClick={() => openTopicDialog()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Topic
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {renderTopicsHierarchy(topics)}
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
                      <Button onClick={() => setIsActivityDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
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

        {/* Topic Dialog - Full Screen */}
        <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 gap-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>
                {editingTopic 
                  ? "Edit Topic" 
                  : parentTopicForSubtopic 
                    ? "Add Subtopic" 
                    : "Add New Topic"}
              </DialogTitle>
              <DialogDescription>
                {editingTopic
                  ? "Update the topic content using the rich text editor below"
                  : parentTopicForSubtopic
                    ? "Create a new subtopic with detailed content"
                    : "Create a new learning topic for this course"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topicTitle">Title *</Label>
                <Input
                  id="topicTitle"
                  placeholder="e.g., Introduction to React Hooks"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topicContent">Content *</Label>
                <RichTextEditor
                  content={newTopic.content}
                  onChange={(content) => setNewTopic({ ...newTopic, content })}
                  placeholder="Enter detailed topic content with rich formatting..."
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtube.com/..."
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
                    onChange={(e) => setNewTopic({ ...newTopic, attachmentUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 border-t">
              <Button variant="outline" onClick={() => setIsTopicDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTopic}>
                {editingTopic ? "Update Topic" : "Add Topic"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activity Dialog */}
        <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
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
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityType">Type *</Label>
                <Select
                  value={newActivity.type}
                  onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}
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
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={newActivity.scheduledDate}
                  onChange={(e) => setNewActivity({ ...newActivity, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddActivity}>Add Activity</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}