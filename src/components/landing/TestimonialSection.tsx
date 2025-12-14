"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Star, ChevronRight, ChevronLeft } from "lucide-react"

export function TestimonialSection() {
    return (
        <section className="py-20 bg-white dark:bg-[#0A1A2F] overflow-hidden">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="relative mb-8">
                        <div className="w-20 h-1 bg-[#00C2FF] mb-6" />
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#0A1A2F] dark:text-white mb-6">
                            What They <span className="text-[#00C2FF]">Say?</span>
                        </h2>
                        <p className="text-[#0A1A2F]/60 dark:text-white/60 leading-relaxed mb-6 max-w-md">
                            TOTC has got more than 100k positive ratings from our users around the world.
                            <br /><br />
                            Some of the students and teachers were greatly helped by the Skilline.
                            <br /><br />
                            Are you too? Please give your assessment
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex border border-[#00C2FF] rounded-full overflow-hidden">
                                <button className="w-12 h-12 flex items-center justify-center hover:bg-[#00C2FF] hover:text-white text-[#00C2FF] transition-colors">
                                    <ChevronLeft />
                                </button>
                                <button className="w-12 h-12 flex items-center justify-center hover:bg-[#00C2FF] hover:text-white text-[#00C2FF] transition-colors border-l border-[#00C2FF]">
                                    <ChevronRight />
                                </button>
                            </div>
                            <a href="#" className="text-[#00C2FF] flex items-center gap-2 hover:underline">
                                Write your assessment <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="relative w-full max-w-lg mx-auto">
                        {/* Background Card */}
                        <Card className="absolute top-4 -right-4 w-full h-full bg-[#00C2FF]/10 border-none rounded-3xl z-0" />

                        {/* Main Testimonial Card */}
                        <Card className="relative z-10 p-8 md:p-12 rounded-3xl border-none shadow-2xl bg-white dark:bg-[#112240]">
                            <div className="flex items-start gap-6 border-l-4 border-[#F48C06] pl-6 mb-8">
                                <p className="text-[#0A1A2F]/70 dark:text-white/70 italic leading-loose">
                                    "Thank you so much to TechSonance. I have developed in my professional carrier as a system administrator. The instructors are fantastic and the materials are world-class."
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden">
                                        <Image
                                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1887"
                                            alt="Student"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0A1A2F] dark:text-white">Gloria Rose</h4>
                                        <div className="flex text-yellow-400 text-xs mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-current" />
                                            ))}
                                            <span className="ml-2 text-gray-400">12 reviews</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
