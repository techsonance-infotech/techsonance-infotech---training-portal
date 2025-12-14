"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Calendar,
  Mail,
  User,
  Users,
  BarChart,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Award,
  Video
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { StatsSection } from "@/components/landing/StatsSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
import { AboutSection } from "@/components/landing/AboutSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { CoursesSection } from "@/components/landing/CoursesSection"
import { TestimonialSection } from "@/components/landing/TestimonialSection"
import { NewsSection } from "@/components/landing/NewsSection"
import { Footer } from "@/components/landing/Footer"

import { Navbar } from "@/components/Navbar"

export default function HomePage() {
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.2 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const floatingCardVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] dark:bg-[#0A1A2F] overflow-x-hidden font-sans relative">
      {/* Navbar */}
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#ecf9ff] dark:bg-[#0A1A2F]/50 relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00C2FF]/5 rounded-full blur-3xl rounded-full" />

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-6xl font-black text-[#0A1A2F] dark:text-white leading-[1.1]"
            >
              <span className="text-[#F48C06]">Studying</span> Online is now much easier
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-[#0A1A2F]/60 dark:text-white/60 max-w-md leading-relaxed"
            >
              TechSonance is an interesting platform that will teach you in more an interactive way
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6">
              <Button className="h-14 px-8 rounded-full bg-[#00C2FF] hover:bg-[#00a0d6] text-white text-lg shadow-xl shadow-[#00C2FF]/30 transition-transform hover:scale-105">
                <Link href="/login">Join for free</Link>
              </Button>

              <div className="flex items-center gap-4 cursor-pointer group">
                <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-[#00C2FF] fill-current ml-1" />
                </div>
                <span className="text-[#0A1A2F] dark:text-white font-medium group-hover:text-[#00C2FF] transition-colors">Watch how it works</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Image & Floating Cards */}
          <div className="relative h-[600px] hidden lg:block">
            {/* Main Student Image Placeholder */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[90%] z-0">
              {/* Assuming we don't have the exact girl image, using a placeholder gradient/frame or a generic illustration */}
              <div className="w-full h-full bg-gradient-to-b from-[#00C2FF]/20 to-[#0A1A2F]/20 rounded-t-[3rem] relative overflow-hidden backdrop-blur-sm border border-white/20">
                <div className="absolute inset-0 flex items-center justify-center text-[#00C2FF]/20">
                  {/* Placeholder for the student image */}
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1740"
                    alt="Student"
                    fill
                    className="object-cover opacity-90 mix-blend-overlay hover:mix-blend-normal transition-all duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Float Card 1: 250k Students */}
            <motion.div
              variants={floatingCardVariants}
              animate="animate"
              className="absolute top-20 left-0 z-20"
            >
              <Card className="bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-2 w-64">
                <div className="flex items-center gap-4 p-2">
                  <div className="w-12 h-12 bg-[#00C2FF] rounded-lg flex items-center justify-center text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1A2F] dark:text-white">250k</h3>
                    <p className="text-sm text-gray-500">Assisted Student</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Float Card 2: Congratulations */}
            <motion.div
              variants={floatingCardVariants}
              animate="animate"
              transition={{ delay: 1 }}
              className="absolute bottom-40 right-[-20px] z-20"
            >
              <Card className="bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-4 w-72">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F48C06] rounded-lg flex items-center justify-center text-white shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A1A2F] dark:text-white">Congratulations</h3>
                    <p className="text-xs text-gray-500">Your admission completed</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                </div>
              </Card>
            </motion.div>

            {/* Float Card 3: User Experience Class */}
            <motion.div
              variants={floatingCardVariants}
              animate="animate"
              transition={{ delay: 2 }}
              className="absolute bottom-10 left-[-40px] z-20"
            >
              <Card className="bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-4 w-64">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                    <User className="absolute inset-0 m-auto text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A1A2F] dark:text-white">User Experience Class</h4>
                    <p className="text-xs text-gray-500">Today at 12.00 PM</p>
                  </div>
                </div>
                <Button className="w-full rounded-full bg-[#E51B75] hover:bg-[#c91666] text-white text-xs h-8">
                  Join Now
                </Button>
              </Card>
            </motion.div>

            {/* Floating Icon */}
            <motion.div
              animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-40 right-10 z-10"
            >
              <div className="w-12 h-12 bg-[#E51B75] rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
                <BarChart className="text-white w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave (SVG) */}
        <div className="hidden lg:block absolute bottom-0 left-0 w-full leading-none z-0">
          <svg className="block w-full h-[150px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#00C2FF" fillOpacity="0.1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <StatsSection />
      <ServicesSection />
      <AboutSection />
      <FeaturesSection />
      <CoursesSection />
      <TestimonialSection />
      <NewsSection />
      <Footer />
    </div>
  )
}
