"use client"

import Image from "next/image"
import { Clock } from "lucide-react"

const articles = [
    {
        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=2670",
        title: "AWS Certified solutions Architect",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        author: "Lina",
        authorAvatar: "https://github.com/shadcn.png",
        price: "$100",
        oldPrice: "$80"
    },
    {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=2576",
        title: "AWS Certified solutions Architect",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        author: "Lina",
        authorAvatar: "https://github.com/shadcn.png",
        price: "$100",
        oldPrice: "$80"
    },
    {
        image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1674",
        title: "AWS Certified solutions Architect",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        author: "Lina",
        authorAvatar: "https://github.com/shadcn.png",
        price: "$100",
        oldPrice: "$80"
    },
    {
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1740",
        title: "AWS Certified solutions Architect",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        author: "Lina",
        authorAvatar: "https://github.com/shadcn.png",
        price: "$100",
        oldPrice: "$80"
    },
]

export function MarketingArticles() {
    return (
        <section className="py-16 bg-white dark:bg-[#0A1A2F] container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#0A1A2F] dark:text-white">Marketing Articles</h2>
                <a href="#" className="text-[#00C2FF] font-medium hover:underline">See all</a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {articles.map((article, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#112240] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                <span>Design</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>3 Month</span>
                            </div>
                        </div>

                        <h3 className="font-bold text-[#0A1A2F] dark:text-white mb-2 line-clamp-2">
                            {article.title}
                        </h3>

                        <p className="text-xs text-[#0A1A2F]/60 dark:text-white/60 mb-4 line-clamp-2 leading-relaxed">
                            {article.desc}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                    <Image src={article.authorAvatar} alt={article.author} fill className="object-cover" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through">{article.price}</span>
                                <span className="text-sm font-bold text-[#00C2FF]">{article.oldPrice}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
