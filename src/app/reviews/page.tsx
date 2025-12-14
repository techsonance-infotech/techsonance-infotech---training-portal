"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageLoader } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/use-auth"
import { AdminReviewDashboard } from "@/components/reviews/admin-review-dashboard"
import { HRReviewDashboard } from "@/components/reviews/hr-review-dashboard"
import { EmployeeReviewDashboard } from "@/components/reviews/employee-review-dashboard"

export default function ReviewsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        setIsInitializing(false)
      }
    }
  }, [user, loading, router])

  if (loading || isInitializing) {
    return (
      <DashboardLayout userRole={user?.role as "admin" | "employee" | "intern" || "employee"}>
        <PageLoader text="Loading reviews..." />
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  const userRole = user.role?.toLowerCase() || "employee"

  return (
    <DashboardLayout userRole={userRole as "admin" | "employee" | "intern"}>
      {userRole === "admin" && <AdminReviewDashboard />}
      {userRole === "hr" && <HRReviewDashboard />}
      {(userRole === "employee" || userRole === "intern") && <EmployeeReviewDashboard />}
    </DashboardLayout>
  )
}
