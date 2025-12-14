"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export function BlogHero() {
    return (
        <div className="bg-[#ecf9ff] dark:bg-[#0A1A2F]/50 py-20">
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <p className="text-[#0A1A2F]/70 dark:text-white/70 font-medium tracking-wide">
                        By Themadhamsal <span className="text-[#00C2FF]">Inspiration</span>
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#0A1A2F] dark:text-white leading-tight">
                        Why Swift UI Should Be on the Radar of Every Mobile Developer
                    </h1>
                    <p className="text-[#0A1A2F]/60 dark:text-white/60 text-lg leading-relaxed max-w-xl">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempos Lorem ipsum dolor sitamen, consectetur adipiscing elit, sed do eiusmod tempor.
                    </p>
                    <Button className="bg-[#00C2FF] hover:bg-[#00a0d6] text-white rounded px-8 h-12">
                        Read More
                    </Button>
                </div>

                <div className="relative aspect-video lg:aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=2069" // Meeting/Laptop image
                        alt="Swift UI"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
    )
}
