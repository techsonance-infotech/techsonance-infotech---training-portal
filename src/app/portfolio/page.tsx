"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageLoader } from "@/components/ui/loading-spinner"
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
import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Heart,
  Plus,
  Search,
  Download,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

interface PortfolioItem {
  id: number
  portfolioId: number
  category: string
  title: string
  description: string | null
  createdAt: string
}

const categories = [
  { value: "qualification", label: "Qualifications", icon: GraduationCap, color: "bg-blue-500" },
  { value: "certification", label: "Certifications", icon: Award, color: "bg-green-500" },
  { value: "skill", label: "Skills", icon: Briefcase, color: "bg-purple-500" },
  { value: "industry_knowledge", label: "Industry Knowledge", icon: BookOpen, color: "bg-orange-500" },
  { value: "personal_quality", label: "Personal Qualities", icon: Heart, color: "bg-pink-500" },
]

export default function PortfolioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [newItem, setNewItem] = useState({
    category: "",
    title: "",
    description: "",
  })

  useEffect(() => {
    if (user) {
      if (user.role !== 'employee' && user.role !== 'intern') {
        router.push('/dashboard')
        return
      }
      fetchPortfolioData()
    }
  }, [user, router])

  const fetchPortfolioData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/portfolio/${user?.id}`)
      if (!response.ok) {
        // If endpoint not found or error, try fallback or handle error
        // Ideally we want to fail gracefully.
        // checking if status is 404, maybe the user has no portfolio yet?
        if (response.status === 404) {
          setItems([])
          return
        }
        throw new Error("Failed to fetch")
      }
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      //   toast.error("Failed to load portfolio")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.category || !newItem.title.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/portfolio/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          category: newItem.category,
          title: newItem.title,
          description: newItem.description || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to add item")

      const data = await response.json()
      setItems([...items, data])
      setNewItem({ category: "", title: "", description: "" })
      setIsDialogOpen(false)
      toast.success("Item added successfully")
    } catch (error) {
      toast.error("Failed to add item")
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || selectedCategory === "" ? true : item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getItemsByCategory = (category: string) => {
    return filteredItems.filter((item) => item.category === category)
  }

  const exportToCV = () => {
    toast.success("CV export feature coming soon!")
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="employee">
        <PageLoader text="Loading portfolio..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">My Portfolio</h1>
            <p className="text-muted-foreground">
              Build and showcase your professional skills and achievements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToCV} className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
              <Download className="h-4 w-4 mr-2" />
              Export CV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="border-[#00C2FF]/20">
                <DialogHeader>
                  <DialogTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Add Portfolio Item</DialogTitle>
                  <DialogDescription>
                    Add a new qualification, certification, skill, or achievement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger className="border-[#00C2FF]/30 focus:border-[#00C2FF]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-[#00C2FF]/20">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Bachelor of Computer Science"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Add details about this item..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      rows={4}
                      className="border-[#00C2FF]/30 focus:border-[#00C2FF]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10">
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white">Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00C2FF]" />
                  <Input
                    placeholder="Search portfolio items..."
                    className="pl-10 border-[#00C2FF]/30 focus:border-[#00C2FF]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px] border-[#00C2FF]/30 focus:border-[#00C2FF]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="border-[#00C2FF]/20">
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-5">
          {categories.map((category, index) => {
            const count = items.filter((item) => item.category === category.value).length
            return (
              <Card key={category.value} className="border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00C2FF]/20 cursor-pointer hover:-translate-y-1 animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="space-y-2">
                  <div className={`w-10 h-10 ${category.color} text-white rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{category.label}</CardTitle>
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">{count}</p>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Portfolio Items by Category */}
        {filteredItems.length === 0 ? (
          <Card className="border-[#00C2FF]/20 animate-in fade-in zoom-in duration-500">
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-[#00C2FF] opacity-50" />
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">No portfolio items yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory
                  ? "No items match your search"
                  : "Start building your portfolio by adding your qualifications, skills, and achievements"}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg transition-all duration-300 hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map((category, catIndex) => {
              const categoryItems = getItemsByCategory(category.value)
              if (categoryItems.length === 0) return null

              return (
                <Card key={category.value} className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${catIndex * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${category.color} text-white rounded-lg transition-transform duration-300 hover:scale-110`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">{category.label}</CardTitle>
                        <CardDescription>
                          {categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryItems.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-[#00C2FF]/5 border border-transparent hover:border-[#00C2FF]/20 transition-all duration-300">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Added {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {index < categoryItems.length - 1 && <Separator className="my-2" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* CV Preview */}
        <Card className="border-[#00C2FF]/20 animate-in fade-in slide-in-from-bottom duration-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">CV Preview</CardTitle>
                <CardDescription>How your portfolio will appear in CV format</CardDescription>
              </div>
              <Button variant="outline" onClick={exportToCV} className="border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-[#00C2FF]/20 rounded-lg p-6 bg-gradient-to-br from-background via-[#00C2FF]/5 to-background space-y-6">
              {/* Header */}
              <div className="text-center pb-6 border-b border-[#00C2FF]/20">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">{user?.name || "Your Name"}</h2>
                <p className="text-muted-foreground">{user?.email || "your.email@company.com"}</p>
                <p className="text-sm text-muted-foreground mt-1">Employee Portfolio</p>
              </div>

              {/* CV Sections */}
              {categories.map((category) => {
                const categoryItems = items.filter((item) => item.category === category.value)
                if (categoryItems.length === 0) return null

                return (
                  <div key={category.value}>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#00C2FF]">
                      <category.icon className="h-5 w-5" />
                      {category.label}
                    </h3>
                    <ul className="space-y-2 ml-7">
                      {categoryItems.map((item) => (
                        <li key={item.id}>
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Your CV preview will appear here once you add portfolio items</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}