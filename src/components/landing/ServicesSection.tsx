"use client"

import { motion } from "framer-motion"
import { FileText, Users, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

const services = [
    {
        icon: FileText,
        title: "Online Billing, Invoicing, & Contracts",
        description: "Simple and secure control of your organization’s financial and legal transactions. Send customized invoices and contracts",
        color: "bg-blue-100 text-blue-600",
    },
    {
        icon: Calendar,
        title: "Easy Scheduling & Attendance Tracking",
        description: "Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance",
        color: "bg-cyan-100 text-cyan-600",
    },
    {
        icon: Users,
        title: "Customer Tracking",
        description: "Automate and track emails to individuals or groups. Skilline’s built-in system helps organize your organization",
        color: "bg-sky-100 text-sky-600",
    },
]

export function ServicesSection() {
    return (
        <section className="py-20 bg-[#F9FAFB] dark:bg-[#0A1A2F]/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0A1A2F] dark:text-white mb-4">
                        <span className="text-[#00C2FF]">All-In-One</span> Cloud Software
                    </h2>
                    <p className="text-[#0A1A2F]/60 dark:text-white/60 max-w-2xl mx-auto">
                        TechSonance is one powerful online software suite that combines all the tools needed to run a successful school or office.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <Card className="h-full p-8 border-none shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden bg-white dark:bg-[#112240]">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                                <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                                    <service.icon className="w-8 h-8" />
                                </div>

                                <h3 className="text-xl font-bold text-[#0A1A2F] dark:text-white mb-4 text-center">
                                    {service.title}
                                </h3>
                                <p className="text-[#0A1A2F]/60 dark:text-white/60 text-center leading-relaxed text-sm">
                                    {service.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
