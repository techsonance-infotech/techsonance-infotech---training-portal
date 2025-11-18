"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Link from "next/link"
import { GraduationCap, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const rememberMe = watch("rememberMe")

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { error, data: session } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        callbackURL: "/dashboard",
      })

      if (error) {
        toast.error("Login failed", {
          description: "Invalid email or password. Please try again.",
        })
        setIsLoading(false)
        return
      }

      toast.success("Login successful!", {
        description: "Redirecting to dashboard...",
      })

      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00C2FF]/20 via-[#0A1A2F]/40 to-[#0A1A2F] dark:from-[#0A1A2F] dark:via-[#00C2FF]/10 dark:to-[#0A1A2F] p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95 shadow-2xl border border-[#00C2FF]/20">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] text-white p-3 rounded-full shadow-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent">IT Training Platform</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your training dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                disabled={isLoading}
                className="border-[#00C2FF]/30 focus:border-[#00C2FF] focus:ring-[#00C2FF]/20"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
                className="border-[#00C2FF]/30 focus:border-[#00C2FF] focus:ring-[#00C2FF]/20"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:from-[#00C2FF]/90 hover:to-[#0A1A2F]/90 text-white shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Need access?{" "}
              <span className="text-[#00C2FF] font-medium">
                Contact your administrator
              </span>
            </div>
          </CardFooter>
        </form>
        <div className="px-6 pb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#00C2FF]/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-[#00C2FF]">Admin:</strong> admin@company.com / Admin123!</p>
            <p><strong className="text-[#00C2FF]">Employee:</strong> john.doe@company.com / Employee123!</p>
            <p><strong className="text-[#00C2FF]">Intern:</strong> intern@company.com / Intern123!</p>
          </div>
        </div>
      </Card>
    </div>
  )
}