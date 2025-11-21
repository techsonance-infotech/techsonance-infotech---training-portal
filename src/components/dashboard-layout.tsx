"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCog,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "admin" | "employee" | "intern"
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending, refetch } = useSession()
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login")
    }
  }, [session, isPending, router])

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token")

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    if (error?.code) {
      toast.error("Sign out failed", {
        description: error.code,
      })
    } else {
      localStorage.removeItem("bearer_token")
      toast.success("Signed out successfully")
      refetch()
      router.push("/login")
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: userRole === "admin" ? "/admin" : "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "employee", "intern"],
    },
    {
      name: "Courses",
      href: userRole === "admin" ? "/admin/courses" : "/dashboard/courses",
      icon: BookOpen,
      roles: ["admin", "employee", "intern"],
    },
    {
      name: "Policies",
      href: userRole === "admin" ? "/admin/policies" : "/dashboard/policies",
      icon: FileText,
      roles: ["admin", "employee", "intern"],
    },
    {
      name: "Portfolio",
      href: "/portfolio",
      icon: Award,
      roles: ["employee", "intern"],
    },
    {
      name: "Reviews",
      href: "/reviews",
      icon: MessageSquare,
      roles: ["admin", "hr", "employee", "intern"],
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Onboarding",
      href: "/admin/onboarding",
      icon: UserCog,
      roles: ["admin"],
    },
  ]

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole || "employee")
  )

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#00C2FF]/20 via-[#0A1A2F]/40 to-[#0A1A2F]">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] mx-auto animate-pulse" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  const Sidebar = () => (
    <div className="flex h-full flex-col border-r border-[#00C2FF]/20 bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[#00C2FF]/20 px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/logo.png"
              alt="TechSonance InfoTech"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">TechSonance</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] text-white shadow-lg"
                  : "text-muted-foreground hover:bg-[#00C2FF]/10 hover:text-[#00C2FF]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-[#00C2FF]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 border-2 border-[#00C2FF]/30">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-[#00C2FF] truncate capitalize">{userRole}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-[#00C2FF]/10">
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-[#00C2FF]" />
            ) : (
              <Moon className="h-4 w-4 text-[#00C2FF]" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-[#00C2FF]/20 bg-card px-4 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[#00C2FF]/10">
                <Menu className="h-6 w-6 text-[#00C2FF]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-2">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/logo.png"
                alt="TechSonance InfoTech"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">TechSonance</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[#00C2FF]/10">
                <Avatar className="h-8 w-8 border-2 border-[#00C2FF]/30">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-[#00C2FF]/20">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4 text-[#00C2FF]" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4 text-[#00C2FF]" />
                    <span>Dark Mode</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between border-b border-[#00C2FF]/20 bg-card px-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">
              {pathname === "/admin" || pathname === "/dashboard"
                ? "Dashboard"
                : pathname.split("/").pop()?.charAt(0).toUpperCase() +
                  pathname.split("/").pop()?.slice(1) || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-[#00C2FF]/10">
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-[#00C2FF]" />
              ) : (
                <Moon className="h-5 w-5 text-[#00C2FF]" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-[#00C2FF]/10">
                  <Avatar className="h-8 w-8 border-2 border-[#00C2FF]/30">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-[#00C2FF]/20">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    <p className="text-xs text-[#00C2FF] capitalize">{userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>
    </div>
  )
}