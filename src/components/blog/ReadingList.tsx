"use client"

import Image from "next/image"

const categories = [
    { name: "UX/UI", image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=1740" },
    { name: "React", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1740" },
    { name: "PHP", image: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97663?auto=format&fit=crop&q=80&w=1740" },
    { name: "JavaScript", image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=1740" },
]

export function ReadingList() {
    return (
        <section className="py-16 bg-white dark:bg-[#0A1A2F] container mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#0A1A2F] dark:text-white mb-8">Reading blog list</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((cat, idx) => (
                    <div key={idx} className="relative h-48 md:h-40 rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                        <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#0A1A2F]/90 backdrop-blur px-6 py-2 rounded-lg shadow-sm">
                            <span className="font-bold text-[#0A1A2F] dark:text-white">{cat.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
