"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageLoader } from "@/components/ui/loading-spinner"
import { useSession } from "@/lib/auth-client"
import { AdminReviewDashboard } from "@/components/reviews/admin-review-dashboard"
import { HRReviewDashboard } from "@/components/reviews/hr-review-dashboard"
import { EmployeeReviewDashboard } from "@/components/reviews/employee-review-dashboard"

export default function ReviewsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }
  }, [session, isPending, router])

  if (isPending || isLoading) {
    return (
      <DashboardLayout userRole={session?.user?.role || "employee"}>
        <PageLoader text="Loading reviews..." />
      </DashboardLayout>
    )
  }

  if (!session?.user) {
    return null
  }

  const userRole = session.user.role?.toLowerCase() || "employee"

  return (
    <DashboardLayout userRole={userRole as "admin" | "employee" | "intern"}>
      {userRole === "admin" && <AdminReviewDashboard />}
      {userRole === "hr" && <HRReviewDashboard />}
      {(userRole === "employee" || userRole === "intern") && <EmployeeReviewDashboard />}
    </DashboardLayout>
  )
}
