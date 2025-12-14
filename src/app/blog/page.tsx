"use client"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/landing/Footer"
import { BlogHero } from "@/components/blog/BlogHero"
import { ReadingList } from "@/components/blog/ReadingList"
import { RelatedBlogs } from "@/components/blog/RelatedBlogs"
import { MarketingArticles } from "@/components/blog/MarketingArticles"

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-[#F0F8FF] dark:bg-[#0A1A2F] overflow-x-hidden font-sans relative">
            <Navbar />

            <div className="pt-24 lg:pt-32">
                <BlogHero />
                <ReadingList />
                <RelatedBlogs />
                <MarketingArticles />
            </div>

            <div className="bg-[#0A1A2F] mt-20">
                <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center rotate-45 mb-4">
                        <span className="font-bold text-white -rotate-45">TOTC</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Subscribe to get our Newsletter</h3>
                        <p className="text-white/60 text-sm max-w-md mx-auto mb-8">
                            Stay up to date with the latest news, announcements, and articles.
                        </p>
                        <div className="flex gap-2 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="bg-[#2B3B55] border-none rounded-full px-6 py-3 text-sm flex-1 focus:ring-2 focus:ring-[#00C2FF] outline-none text-white placeholder:text-gray-400"
                            />
                            <button className="bg-[#00C2FF] hover:bg-[#00a0d6] text-white rounded-full px-8 font-bold transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <Footer />
                </div>
            </div>
        </div>
    )
}
