"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Footer() {
    return (
        <footer className="bg-[#0A1A2F] text-white pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-white rounded-lg rotate-45 flex items-center justify-center shadow-lg">
                                <span className="font-bold text-[#0A1A2F] text-xs -rotate-45">TS</span>
                            </div>
                            <span className="text-xl font-bold tracking-wide">TechSonance</span>
                        </div>
                        <p className="text-white/60 leading-relaxed text-sm">
                            Virtual Class Management System is the society of the 2024. TechSonance is the solution for all your training needs.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Company</h4>
                        <ul className="space-y-4 text-white/60 text-sm">
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6">Support</h4>
                        <ul className="space-y-4 text-white/60 text-sm">
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Legal</Link></li>
                            <li><Link href="#" className="hover:text-[#00C2FF] transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Stay Up to Date</h4>
                        <p className="text-white/60 text-sm mb-4">
                            Subscribe to our newsletter to receive the latest news and specialized training resources.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="bg-[#2B3B55] border-none rounded-full px-6 py-3 text-sm flex-1 focus:ring-2 focus:ring-[#00C2FF] outline-none"
                            />
                            <Button className="rounded-full bg-[#00C2FF] hover:bg-[#00a0d6] px-8">
                                Send
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
                    <p>© 2024 TechSonance InfoTech. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
