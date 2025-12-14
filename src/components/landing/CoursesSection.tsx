"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Star, Clock, Eye } from "lucide-react"

const courses = [
    {
        image: "https://images.unsplash.com/photo-1561089489-f13d5e730d72?auto=format&fit=crop&q=80&w=1974",
        category: "Design",
        title: "AWS Certification",
        rating: 5,
        reviews: 120,
        author: "Lina",
        price: "$100",
        oldPrice: "$120",
        duration: "3 Month",
    },
    {
        image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=2070",
        category: "Development",
        title: "Full Stack Web Dev",
        rating: 5,
        reviews: 85,
        author: "Lina",
        price: "$120",
        oldPrice: "$150",
        duration: "6 Month",
    },
    {
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=2070",
        category: "Business",
        title: "Data Science & AI",
        rating: 4,
        reviews: 40,
        author: "Lina",
        price: "$150",
        oldPrice: "$200",
        duration: "4 Month",
    },
    {
        image: "https://images.unsplash.com/photo-1629904853716-600abd17529c?auto=format&fit=crop&q=80&w=2112",
        category: "Marketing",
        title: "Digital Marketing",
        rating: 5,
        reviews: 60,
        author: "Lina",
        price: "$90",
        oldPrice: "$110",
        duration: "2 Month",
    },
]

export function CoursesSection() {
    return (
        <section className="py-20 bg-[#F9FAFB] dark:bg-[#0A1A2F]/50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0A1A2F] dark:text-white mb-2">
                            Explore <span className="text-[#00C2FF]">In-Demand</span> Training
                        </h2>
                        <p className="text-[#0A1A2F]/60 dark:text-white/60">
                            Choose from our most popular tracks
                        </p>
                    </div>
                    <a href="#" className="hidden md:block text-[#00C2FF] font-bold hover:underline">See all</a>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {courses.map((course, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-[#112240] group">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <span className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">{course.category}</span>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-[#0A1A2F] dark:text-white line-clamp-1">{course.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < course.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">({course.reviews})</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[#00C2FF] font-bold text-lg">{course.price}</span>
                                            <span className="block text-gray-400 text-sm line-through decoration-red-400">{course.oldPrice}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-white/10 pt-4 flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200">
                                                {/* User avatar placeholder */}
                                            </div>
                                            <span>{course.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
