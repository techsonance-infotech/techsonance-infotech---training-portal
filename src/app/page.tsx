"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Users, Award, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Courses",
      description: "Access 13+ specialized training tracks from .NET to AI",
    },
    {
      icon: Users,
      title: "Peer Feedback",
      description: "Annual performance reviews and skill evaluations",
    },
    {
      icon: Award,
      title: "Portfolio Builder",
      description: "Build and showcase your professional skills and certifications",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics",
    },
    {
      icon: Shield,
      title: "Company Policies",
      description: "Stay compliant with required training and policies",
    },
    {
      icon: GraduationCap,
      title: "Expert-Led Training",
      description: "Learn from industry professionals and mentors",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00C2FF]/20 via-[#0A1A2F]/40 to-[#0A1A2F] dark:from-[#0A1A2F] dark:via-[#00C2FF]/10 dark:to-[#0A1A2F]">
      {/* Header */}
      <header className="border-b border-[#00C2FF]/20 bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-sm sticky top-0 z-50 animate-in fade-in slide-in-from-top duration-500">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-lg animate-in zoom-in duration-500">
              <Image
                src="/logo.png"
                alt="TechSonance InfoTech"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">TechSonance InfoTech</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-[#00C2FF]/10 hover:text-[#00C2FF] transition-all duration-300">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center animate-in fade-in slide-in-from-bottom duration-700">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block animate-in zoom-in duration-500 delay-100">
            <span className="px-4 py-2 bg-gradient-to-r from-[#00C2FF]/20 to-[#0A1A2F]/20 border border-[#00C2FF]/30 text-[#00C2FF] rounded-full text-sm font-medium">
              Where Innovation Finds Its Resonance
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight animate-in slide-in-from-bottom duration-700 delay-200">
            Empower Your Career with
            <span className="block bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent mt-2">Expert Training</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in duration-700 delay-300">
            Access world-class training programs, build your professional portfolio, and grow your skills with our comprehensive IT training platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            <Button size="lg" asChild className="text-lg bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link href="/login">Start Learning Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg border-[#00C2FF]/30 hover:border-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all duration-300">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive tools and resources for professional development
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-[#0A1A2F]/60 dark:bg-[#0A1A2F]/80 border-[#00C2FF]/20 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#00C2FF]/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 group backdrop-blur-sm" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 bg-[#00C2FF]/10 border border-[#00C2FF]/40 rounded-lg flex items-center justify-center group-hover:bg-[#00C2FF]/20 group-hover:border-[#00C2FF]/60 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-[#00C2FF]" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-white group-hover:text-[#00C2FF] transition-colors duration-300">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 dark:text-gray-400">{feature.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom duration-700">
        <Card className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] text-white border-none shadow-2xl hover:shadow-[#00C2FF]/50 transition-all duration-500">
          <CardContent className="py-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="animate-in zoom-in duration-500 delay-100">
                <div className="text-4xl font-bold mb-2">13+</div>
                <div className="text-white/80">Training Tracks</div>
              </div>
              <div className="animate-in zoom-in duration-500 delay-200">
                <div className="text-4xl font-bold mb-2">6</div>
                <div className="text-white/80">Company Policies</div>
              </div>
              <div className="animate-in zoom-in duration-500 delay-300">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-white/80">Career Growth</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom duration-700">
        <Card className="border-2 border-[#00C2FF]/30 hover:border-[#00C2FF]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#00C2FF]/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join our IT training platform today and unlock access to expert-led courses, portfolio tools, and career development resources.
            </p>
            <Button size="lg" asChild className="text-lg bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Link href="/login">Sign In to Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00C2FF]/20 bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/logo.png"
                  alt="TechSonance InfoTech"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">TechSonance InfoTech</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TechSonance InfoTech. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}