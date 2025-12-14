"use client"

import { motion } from "framer-motion"
import { Users2, Sliders, FileCheck } from "lucide-react"

export function FeaturesSection() {
    return (
        <section className="py-20 overflow-hidden space-y-32">
            {/* Feature 1: Classroom */}
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative order-2 md:order-1"
                >
                    <div className="relative z-10 p-4">
                        <div className="absolute top-0 left-0 w-20 h-20 bg-[#00C2FF] rounded-full blur-3xl opacity-20" />
                        <div className="relative w-16 h-16 bg-[#00C2FF] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#00C2FF]/30">
                            <Users2 className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-6">
                            Everything you can do in a physical classroom, <span className="text-[#00C2FF]">you can do with TOTC</span>
                        </h2>
                        <p className="text-[#0A1A2F]/60 dark:text-white/60 leading-relaxed mb-6">
                            TOTC’s school management software helps traditional and online schools manage scheduling, attendance, payments and virtual classrooms all in one secure cloud-based system.
                        </p>
                        <a href="#" className="text-[#0A1A2F] dark:text-white underline decoration-[#00C2FF] decoration-2 underline-offset-4 font-medium hover:text-[#00C2FF] transition-colors">See more features</a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative h-[400px] w-full order-1 md:order-2"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00C2FF]/10 rounded-full blur-3xl" />
                    {/* Abstract UI representation */}
                    <div className="absolute top-10 right-10 w-full h-full bg-[url('https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1674')] bg-cover bg-center rounded-l-[4rem] shadow-2xl border-4 border-white dark:border-[#0A1A2F]" />
                </motion.div>
            </div>

            {/* Feature 2: Tools */}
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative h-[400px] w-full"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00C2FF]/10 rounded-full blur-3xl" />
                    <div className="absolute top-10 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1740')] bg-cover bg-center rounded-r-[4rem] shadow-2xl border-4 border-white dark:border-[#0A1A2F]" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10 p-4"
                >
                    <div className="relative w-16 h-16 bg-[#00C2FF] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#00C2FF]/30">
                        <Sliders className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-6">
                        <span className="text-[#00C2FF]">Tools</span> For Teachers And Learners
                    </h2>
                    <p className="text-[#0A1A2F]/60 dark:text-white/60 leading-relaxed mb-6">
                        Class has a dynamic set of teaching tools built to be deployed and used during class. Teachers can handout assignments in real-time for students to complete and submit.
                    </p>
                </motion.div>
            </div>

            {/* Feature 3: Quiz/Assessments */}
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative order-2 md:order-1"
                >
                    <div className="relative z-10 p-4">
                        <div className="relative w-16 h-16 bg-[#00C2FF] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#00C2FF]/30">
                            <FileCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-6">
                            Assessments, <span className="text-[#00C2FF]">Quizzes</span>, Tests
                        </h2>
                        <p className="text-[#0A1A2F]/60 dark:text-white/60 leading-relaxed mb-6">
                            Easily launch live assignments, quizzes, and tests. Student results are automatically entered in the online gradebook.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative h-[400px] w-full order-1 md:order-2"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00C2FF]/10 rounded-full blur-3xl" />
                    <div className="absolute top-10 right-10 w-full h-full bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1740')] bg-cover bg-center rounded-l-[4rem] shadow-2xl border-4 border-white dark:border-[#0A1A2F]" />
                </motion.div>
            </div>
        </section>
    )
}
