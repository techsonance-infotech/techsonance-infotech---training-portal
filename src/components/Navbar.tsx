"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Navbar() {
    const pathname = usePathname()

    return (
        <header className="absolute top-0 w-full z-50">
            <div className="container mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/logo.png"
                                alt="TechSonance InfoTech"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent tracking-wide">TechSonance InfoTech</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    {[
                        { label: "Home", href: "/" },
                        { label: "Courses", href: "/courses" },
                        { label: "Careers", href: "/careers" },
                        { label: "Blog", href: "/blog" },
                        { label: "About Us", href: "/about" }
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`font-medium transition-colors ${pathname === item.href
                                    ? "text-[#00C2FF]"
                                    : "text-[#0A1A2F]/70 dark:text-white/70 hover:text-[#00C2FF]"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className="hidden md:flex bg-white text-[#0A1A2F] hover:text-[#00C2FF] rounded-full px-6 shadow-sm hover:shadow-md transition-all">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button className="bg-[#00C2FF]/20 text-[#0A1A2F] dark:text-white hover:bg-[#00C2FF] hover:text-white rounded-full px-6 transition-all border border-[#00C2FF]">
                        <Link href="/login">Sign Up</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
