"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Check, X, Search, UserPlus, Clock, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"


interface User {
    id: string
    name: string
    email: string
    role: string
    status: string
    createdAt: string
}

export default function RegistrationsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/users?limit=100&status=!active")
            if (!response.ok) throw new Error("Failed to fetch users")
            const data = await response.json()

            const inactiveUsers = Array.isArray(data) ? data : []

            setUsers(inactiveUsers)
        } catch (error) {
            toast.error("Error loading registrations")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setProcessingId(userId)
        try {
            const response = await fetch(`/api/admin/registrations/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Action failed")
            }

            toast.success(`User ${action}d successfully`)
            setUsers((prev) => prev.filter((u) => u.id !== userId))
        } catch (error) {
            toast.error(`Failed to ${action} user`, {
                description: (error as Error).message
            })
        } finally {
            setProcessingId(null)
        }
    }

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <DashboardLayout userRole="admin">
            <div className="space-y-6">
                {/* Header Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <Clock className="h-4 w-4 text-[#00C2FF]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                                {users.length}
                            </div>
                            <p className="text-xs text-muted-foreground">Waiting for review</p>
                        </CardContent>
                    </Card>

                    <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Roles Requested</CardTitle>
                            <UserPlus className="h-4 w-4 text-[#00C2FF]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
                                {Array.from(new Set(users.map(u => u.role))).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Distinct roles</p>
                        </CardContent>
                    </Card>

                    <Card className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Check</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-[#00C2FF]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Standard</div>
                            <p className="text-xs text-muted-foreground">Verification protocol</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-[#00C2FF]/20 shadow-md">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent text-xl">
                                    Registration Requests
                                </CardTitle>
                                <CardDescription>Review and manage new account applications</CardDescription>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00C2FF]" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-9 border-[#00C2FF]/30 focus:border-[#00C2FF] focus:ring-[#00C2FF]/20 rounded-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-[#00C2FF]" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-[#00C2FF]/20">
                                <UserPlus className="h-12 w-12 mx-auto mb-4 text-[#00C2FF] opacity-30" />
                                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No pending requests</p>
                                <p className="text-sm">All caught up! Check back later for new registrations.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredUsers.map((user) => (
                                    <div key={user.id}>
                                        <Card className="overflow-hidden border border-[#00C2FF]/20 hover:border-[#00C2FF]/60 hover:shadow-lg hover:shadow-[#00C2FF]/10 transition-all duration-300">
                                            <div className="h-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F]" />
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{user.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/5">
                                                        {user.role}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center text-xs text-muted-foreground mb-6">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                                                </div>

                                                <div className="flex gap-3">
                                                    <Button
                                                        className="flex-1 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:opacity-90 text-white border-0 shadow-md"
                                                        onClick={() => handleAction(user.id, 'approve')}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Check className="mr-2 h-4 w-4" /> Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                        onClick={() => handleAction(user.id, 'reject')}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <X className="mr-2 h-4 w-4" /> Reject
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout >
    )
}
