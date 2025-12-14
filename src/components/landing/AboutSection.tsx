"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AboutSection() {
    return (
        <section className="py-20 bg-white dark:bg-[#0A1A2F]">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative text-center md:text-left"
                >
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-6">
                        What is <span className="text-[#00C2FF]">TOTC?</span>
                    </h2>
                    <p className="text-[#0A1A2F]/70 dark:text-white/70 leading-relaxed mb-8">
                        TOTC is a platform that allows educators to create online classes whereby they can store the course materials online; manage assignments, quizzes and exams; monitor due dates; grade results and provide students with feedback all in one place.
                    </p>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-4 rounded-xl bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center h-[200px] shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[#0A1A2F]/40 group-hover:bg-[#0A1A2F]/20 transition-colors" />
                            <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                                FOR INSTRUCTORS
                            </div>
                            <Button variant="outline" className="opacity-0 group-hover:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent border-white text-white hover:bg-white hover:text-[#0A1A2F] transition-all">Start a class today</Button>
                        </div>
                        <div className="p-4 rounded-xl bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center h-[200px] shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[#0A1A2F]/40 group-hover:bg-[#0A1A2F]/20 transition-colors" />
                            <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                                FOR STUDENTS
                            </div>
                            <Button variant="outline" className="opacity-0 group-hover:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent border-white text-white hover:bg-white hover:text-[#0A1A2F] transition-all">Enter Access Code</Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    {/* Placeholder for video/image stack - assuming a placeholder image for now */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#112240]">
                        <Image
                            src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1740"
                            alt="About TOTC"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group hover:bg-black/10 transition-colors cursor-pointer">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-[#00C2FF] border-b-[10px] border-b-transparent ml-1" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
