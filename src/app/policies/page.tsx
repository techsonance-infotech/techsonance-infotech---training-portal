"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLoader } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Search, ExternalLink, Shield, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Policy {
  id: number
  title: string
  description: string
  content: string
  documentUrl: string | null
  required: boolean
  createdAt: string
  updatedAt: string
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/policies?limit=100")
      if (!response.ok) {
        throw new Error("Failed to fetch policies")
      }
      const data = await response.json()
      setPolicies(data)
    } catch (error) {
      toast.error("Failed to load policies")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy)
    setIsDialogOpen(true)
  }

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const requiredPolicies = filteredPolicies.filter((p) => p.required)
  const optionalPolicies = filteredPolicies.filter((p) => !p.required)

  if (isLoading) {
    return (
      <DashboardLayout userRole="employee">
        <PageLoader text="Loading policies..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">Company Policies</h1>
            <p className="text-muted-foreground">
              Review important company policies and training materials
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{policies.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Required Reading</CardTitle>
                <Shield className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requiredPolicies.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Optional Resources</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{optionalPolicies.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
        </Card>

        {/* Required Policies Section */}
        {requiredPolicies.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-semibold">Required Policies</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requiredPolicies.map((policy) => (
                <Card key={policy.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="bg-destructive/10 text-destructive p-2 rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-3 line-clamp-2">
                      {policy.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {policy.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewPolicy(policy)}
                    >
                      View Policy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Optional Policies Section */}
        {optionalPolicies.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Optional Resources</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {optionalPolicies.map((policy) => (
                <Card key={policy.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-base mt-3 line-clamp-2">
                      {policy.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {policy.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewPolicy(policy)}
                    >
                      View Policy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPolicies.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No policies found" : "No policies available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Policies will appear here once they are created by administrators"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Policy Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{selectedPolicy?.title}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {selectedPolicy?.description}
                  </DialogDescription>
                </div>
                {selectedPolicy?.required && (
                  <Badge variant="destructive" className="ml-2">
                    Required
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedPolicy?.content}
                </div>
              </div>
              {selectedPolicy?.documentUrl && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (selectedPolicy?.documentUrl) {
                        window.open(selectedPolicy.documentUrl, "_blank", "noopener,noreferrer")
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Document
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
