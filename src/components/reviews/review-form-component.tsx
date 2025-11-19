"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Star, Save, Send, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface KPIScore {
  name: string
  score: number
}

interface ReviewFormData {
  overallRating?: number
  goalsAchievement?: string
  strengths?: string
  improvements?: string
  kpiScores?: KPIScore[]
  additionalComments?: string
}

interface ReviewFormComponentProps {
  cycleId: number
  employeeId: string
  employeeName: string
  reviewerId: string
  reviewerType: "self" | "peer" | "client" | "manager"
  existingFormId?: number
  existingData?: ReviewFormData
  onSuccess?: () => void
  onCancel?: () => void
  readOnly?: boolean
}

const defaultKPIs = [
  { name: "Technical Skills", score: 3 },
  { name: "Communication", score: 3 },
  { name: "Teamwork", score: 3 },
  { name: "Problem Solving", score: 3 },
  { name: "Leadership", score: 3 },
]

export function ReviewFormComponent({
  cycleId,
  employeeId,
  employeeName,
  reviewerId,
  reviewerType,
  existingFormId,
  existingData,
  onSuccess,
  onCancel,
  readOnly = false,
}: ReviewFormComponentProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    overallRating: existingData?.overallRating || undefined,
    goalsAchievement: existingData?.goalsAchievement || "",
    strengths: existingData?.strengths || "",
    improvements: existingData?.improvements || "",
    kpiScores: existingData?.kpiScores || defaultKPIs,
    additionalComments: existingData?.additionalComments || "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Calculate overall rating from KPI scores
  useEffect(() => {
    if (formData.kpiScores && formData.kpiScores.length > 0) {
      const avgScore = formData.kpiScores.reduce((sum, kpi) => sum + kpi.score, 0) / formData.kpiScores.length
      const roundedRating = Math.round(avgScore)
      if (formData.overallRating !== roundedRating) {
        setFormData(prev => ({ ...prev, overallRating: roundedRating }))
      }
    }
  }, [formData.kpiScores])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled || readOnly) return

    const interval = setInterval(() => {
      handleSaveDraft(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [formData, autoSaveEnabled, readOnly])

  const handleKPIChange = (index: number, value: number) => {
    const newKPIScores = [...(formData.kpiScores || [])]
    newKPIScores[index] = { ...newKPIScores[index], score: value }
    setFormData({ ...formData, kpiScores: newKPIScores })
  }

  const validateForm = (forSubmission: boolean = false): boolean => {
    if (forSubmission) {
      if (!formData.overallRating) {
        toast.error("Overall rating is required")
        return false
      }
      if (!formData.goalsAchievement?.trim()) {
        toast.error("Goals achievement is required")
        return false
      }
      if (!formData.strengths?.trim()) {
        toast.error("Strengths are required")
        return false
      }
      if (!formData.improvements?.trim()) {
        toast.error("Areas for improvement are required")
        return false
      }
    }
    return true
  }

  const handleSaveDraft = async (autoSave: boolean = false) => {
    if (readOnly) return

    if (!autoSave) {
      setIsSaving(true)
    }

    try {
      const token = localStorage.getItem("bearer_token")
      const url = existingFormId 
        ? `/api/reviews/forms/${existingFormId}`
        : "/api/reviews/forms"
      
      const method = existingFormId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cycleId,
          employeeId,
          reviewerId,
          reviewerType,
          status: "draft",
          overallRating: formData.overallRating,
          goalsAchievement: formData.goalsAchievement,
          strengths: formData.strengths,
          improvements: formData.improvements,
          kpiScores: JSON.stringify(formData.kpiScores),
          additionalComments: formData.additionalComments,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save draft")
      }

      setLastSaved(new Date())
      if (!autoSave) {
        toast.success("Draft saved successfully")
      }
    } catch (error) {
      if (!autoSave) {
        toast.error("Failed to save draft")
        console.error(error)
      }
    } finally {
      if (!autoSave) {
        setIsSaving(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (readOnly) return

    if (!validateForm(true)) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("bearer_token")
      const url = existingFormId 
        ? `/api/reviews/forms/${existingFormId}`
        : "/api/reviews/forms"
      
      const method = existingFormId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cycleId,
          employeeId,
          reviewerId,
          reviewerType,
          status: "submitted",
          overallRating: formData.overallRating,
          goalsAchievement: formData.goalsAchievement,
          strengths: formData.strengths,
          improvements: formData.improvements,
          kpiScores: JSON.stringify(formData.kpiScores),
          additionalComments: formData.additionalComments,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit review")
      }

      toast.success("Review submitted successfully")
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error("Failed to submit review")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
            {reviewerType === "self" ? "Self Review" : `Review for ${employeeName}`}
          </CardTitle>
          <CardDescription>
            {readOnly 
              ? "Viewing submitted review" 
              : "Complete the review form. Drafts are auto-saved every 30 seconds."}
          </CardDescription>
          {lastSaved && !readOnly && (
            <p className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* KPI Scores */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Key Performance Indicators</CardTitle>
          <CardDescription>Rate each area from 1 (Poor) to 5 (Excellent)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.kpiScores?.map((kpi, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{kpi.name}</Label>
                <Badge variant="outline" className="bg-[#00C2FF]/10 text-[#00C2FF]">
                  {kpi.score} / 5
                </Badge>
              </div>
              {readOnly ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-6 w-6 ${
                        rating <= kpi.score
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <Slider
                  value={[kpi.score]}
                  onValueChange={(value) => handleKPIChange(index, value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Overall Rating */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Overall Rating</CardTitle>
          <CardDescription>Auto-calculated from KPI scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star
                key={rating}
                className={`h-8 w-8 ${
                  rating <= (formData.overallRating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-lg font-bold text-[#00C2FF]">
              {formData.overallRating || 0} / 5
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Goals Achievement */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Goals Achievement</CardTitle>
          <CardDescription>Describe how well goals were achieved</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.goalsAchievement}
            onChange={(e) => setFormData({ ...formData, goalsAchievement: e.target.value })}
            placeholder="Describe the key goals achieved during this review period..."
            rows={4}
            className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Strengths</CardTitle>
          <CardDescription>Highlight key strengths and positive contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.strengths}
            onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
            placeholder="List the key strengths demonstrated during this period..."
            rows={4}
            className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Areas for Improvement</CardTitle>
          <CardDescription>Identify areas where growth is needed</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.improvements}
            onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
            placeholder="Describe areas where improvement or development would be beneficial..."
            rows={4}
            className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Additional Comments */}
      <Card className="border-[#00C2FF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Additional Comments</CardTitle>
          <CardDescription>Any other feedback or observations (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.additionalComments}
            onChange={(e) => setFormData({ ...formData, additionalComments: e.target.value })}
            placeholder="Add any additional comments or feedback..."
            rows={4}
            className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {autoSaveEnabled ? "Auto-save enabled" : "Auto-save disabled"}
            </span>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSaving || isSubmitting}
                className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
              >
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleSaveDraft(false)}
              disabled={isSaving || isSubmitting}
              className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting}
              className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
