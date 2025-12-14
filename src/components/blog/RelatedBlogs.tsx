"use client"

import Image from "next/image"
import { Eye } from "lucide-react"

const blogs = [
    {
        title: "Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution",
        description: "Class, launched less than a year ago by Blackboard co-founder Michael Chasen, integrates exclusively...",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1740",
        author: "Lina",
        authorAvatar: "https://github.com/shadcn.png",
        views: "251,232"
    },
    {
        title: "Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution",
        description: "Class, launched less than a year ago by Blackboard co-founder Michael Chasen, integrates exclusively...",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2070",
        author: "Lina",
        authorAvatar: "https://github.com/shadcn.png",
        views: "251,232"
    },
]

export function RelatedBlogs() {
    return (
        <section className="py-10 bg-[#ecf9ff] dark:bg-[#0A1A2F]/30">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-[#0A1A2F] dark:text-white">Related Blog</h2>
                    <a href="#" className="text-[#00C2FF] font-medium hover:underline">See all</a>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {blogs.map((blog, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#112240] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6">
                                <Image
                                    src={blog.image}
                                    alt="Blog thumbnail"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <h3 className="text-xl font-bold text-[#0A1A2F] dark:text-white mb-4 line-clamp-2">
                                {blog.title}
                            </h3>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                    <Image src={blog.authorAvatar} alt={blog.author} fill className="object-cover" />
                                </div>
                                <span className="text-sm text-gray-500 font-medium">{blog.author}</span>
                            </div>

                            <p className="text-[#0A1A2F]/60 dark:text-white/60 leading-relaxed mb-6 text-sm line-clamp-2">
                                {blog.description}
                            </p>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/10">
                                <a href="#" className="text-[#0A1A2F]/70 dark:text-white/70 hover:text-[#00C2FF] text-sm underline decoration-1 underline-offset-4">Read more</a>
                                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                    <Eye className="w-4 h-4" />
                                    <span>{blog.views}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
