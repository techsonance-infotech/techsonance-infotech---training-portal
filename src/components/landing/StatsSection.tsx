"use client"

import { motion } from "framer-motion"

const stats = [
    { value: "15K+", label: "Students" },
    { value: "75%", label: "Total Success" },
    { value: "35", label: "Main Questions" },
    { value: "26", label: "Chief Experts" },
    { value: "16", label: "Years of Experience" },
]

export function StatsSection() {
    return (
        <section className="py-20 bg-white dark:bg-[#0A1A2F]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
                        Our Success
                    </h2>
                    <p className="text-[#0A1A2F]/60 dark:text-white/60 max-w-2xl mx-auto">
                        Ornare id gravida ultricies at viverra magna tincidunt nunc. In accumsan malesuada lorem ut.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <h3 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent mb-2">
                                {stat.value}
                            </h3>
                            <p className="text-[#0A1A2F] dark:text-gray-300 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
