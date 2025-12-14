"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const news = [
    {
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070",
        tag: "PRESS RELEASE",
        title: "TechSonance launches new AI-driven curriculum for 2025",
        description: "Our new platform integration brings personalized learning paths to every student.",
        author: "Admin",
        avatar: "https://github.com/shadcn.png"
    },
    {
        image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1740",
        tag: "NEWS",
        title: "Partnership announced with top tech giants",
        description: "Major tech companies join forces with TechSonance to provide internship opportunities.",
        author: "Admin",
        avatar: "https://github.com/shadcn.png"
    },
    {
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070",
        tag: "NEWS",
        title: "Top 10 skills for software developers in 2025",
        description: "We analyze the most in-demand skills in the current job market.",
        author: "Admin",
        avatar: "https://github.com/shadcn.png"
    },
    {
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070",
        tag: "COMMUNITY",
        title: "Annual Hackathon Winners Announced",
        description: "See the amazing projects built by our student community this weekend.",
        author: "Admin",
        avatar: "https://github.com/shadcn.png"
    },
]

export function NewsSection() {
    return (
        <section className="py-20 bg-[#ecf9ff] dark:bg-[#0A1A2F]/30">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
                        Lastest News and Resources
                    </h2>
                    <p className="text-[#0A1A2F]/60 dark:text-white/60 max-w-2xl mx-auto">
                        See the developments that have occurred to TechSonance in the world
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl overflow-hidden bg-white dark:bg-[#112240] shadow-lg"
                    >
                        <div className="relative h-[300px] w-full">
                            <Image
                                src={news[0].image}
                                alt={news[0].title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-8">
                            <span className="inline-block bg-[#00C2FF] text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">{news[0].tag}</span>
                            <h3 className="text-2xl font-bold text-[#0A1A2F] dark:text-white mb-4 hover:text-[#00C2FF] cursor-pointer transition-colors">
                                {news[0].title}
                            </h3>
                            <p className="text-[#0A1A2F]/60 dark:text-white/60 leading-relaxed mb-6">
                                {news[0].description}
                            </p>
                            <a href="#" className="text-[#0A1A2F] dark:text-white underline decoration-[#00C2FF] hover:text-[#00C2FF] transition-colors">Read more</a>
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        {news.slice(1).map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex gap-6 items-center bg-white dark:bg-[#112240] p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative w-32 h-24 shrink-0 rounded-xl overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <span className="text-[#0A1A2F]/40 dark:text-white/40 text-xs font-bold tracking-wider mb-2 block">{item.tag}</span>
                                    <h4 className="flex-1 font-bold text-[#0A1A2F] dark:text-white text-lg leading-tight mb-2 hover:text-[#00C2FF] cursor-pointer transition-colors line-clamp-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-[#0A1A2F]/60 dark:text-white/60 line-clamp-1">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

