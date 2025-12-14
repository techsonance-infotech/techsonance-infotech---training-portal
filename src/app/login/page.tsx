"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, Eye, EyeOff, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import siteContent from "@/config/site-content.json"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// --- Schemas ---
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

const registerSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot Password States
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request')
  const [resetEmail, setResetEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    setValue: setLoginValue,
    watch: watchLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })
  const rememberMe = watchLogin("rememberMe")

  // Register Form
  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Handlers
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error("Login failed", { description: result.error || "Please try again." })
        setIsLoading(false)
        return
      }

      toast.success("Welcome back!", { description: "Redirecting to dashboard..." })

      if (result.user.role === 'admin') {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    } catch (error) {
      toast.error("An error occurred", { description: "Please try again later." })
      setIsLoading(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const createResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: "intern",
        }),
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok) {
        toast.error("Registration failed", { description: createResult.error || "Please try again." })
        setIsLoading(false)
        return
      }

      // Instead of auto-login, show success message about account status
      toast.success("Account created successfully!", {
        description: "Your account is currently INACTIVE. Please wait for Admin approval."
      })

      setIsLoading(false)
      setIsLogin(true) // Switch back to login view

    } catch (error) {
      toast.error("An error occurred", { description: "Please try again later." })
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Email required", { description: "Please enter your email address." })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      })

      // Even if failed for security we might show success, but here if error is 500 we show error
      if (!response.ok && response.status === 500) {
        toast.error("Error", { description: "Something went wrong. Please try again." })
      } else {
        toast.success("OTP Sent", { description: "If an account exists, you will receive an OTP." })
        setResetStep('verify')
      }
    } catch (error) {
      toast.error("Error", { description: "Network error." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      toast.error("Missing fields", { description: "Please enter OTP and new password." })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword }),
      })

      const result = await response.json()
      if (!response.ok) {
        toast.error("Reset failed", { description: result.error || "Invalid OTP" })
      } else {
        toast.success("Password Reset", { description: "You can now login with your new password." })
        setIsForgotPasswordOpen(false)
        setResetStep('request')
        setOtp("")
        setNewPassword("")
      }
    } catch (error) {
      toast.error("Error", { description: "Network error." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Left Side - Image (Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-200">
        <Image
          src="/login-hero.png"
          alt="Students in classroom"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white z-10">
          <h1 className="text-4xl font-bold mb-2">{siteContent.loginPage.hero.title}</h1>
          <p className="text-xl opacity-90">{siteContent.loginPage.hero.subtitle}</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {siteContent.loginPage.form.welcomeTitle}
            </h2>
          </div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-8">
            <div className="relative bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex w-64 h-12 shadow-inner">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] rounded-full shadow-md z-0"
                animate={{ x: isLogin ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ x: isLogin ? 4 : 4 }}
                initial={false}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 relative z-10 text-sm font-medium transition-colors duration-200 rounded-full ${isLogin ? "text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 relative z-10 text-sm font-medium transition-colors duration-200 rounded-full ${!isLogin ? "text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
              >
                Register
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground mb-6 whitespace-pre-line">
            {siteContent.loginPage.form.description}
          </div>

          {/* Forms */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmitLogin(onLoginSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        placeholder="Enter your Email"
                        {...registerLogin("email")}
                        className="pl-4 rounded-full border-[#00C2FF] focus:border-[#00C2FF] focus:ring-[#00C2FF]/20 h-12"
                      />
                    </div>
                    {loginErrors.email && <p className="text-xs text-red-500 pl-4">{loginErrors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your Password"
                        {...registerLogin("password")}
                        className="pl-4 pr-10 rounded-full border-[#00C2FF] focus:border-[#00C2FF] focus:ring-[#00C2FF]/20 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginErrors.password && <p className="text-xs text-red-500 pl-4">{loginErrors.password.message}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 pl-1">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(c) => setLoginValue("rememberMe", c as boolean)}
                        className="border-gray-400 data-[state=checked]:bg-[#00C2FF] data-[state=checked]:border-[#00C2FF]"
                      />
                      <Label htmlFor="rememberMe" className="text-sm font-normal text-gray-600">Remember me</Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-sm text-gray-600 hover:text-[#00C2FF]"
                    >
                      Forgot Password ?
                    </button>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-40 rounded-full bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:opacity-90 text-white shadow-lg h-12 text-base font-normal border-0"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmitRegister(onRegisterSubmit)}
                  className="space-y-4" // Slightly tighter spacing
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-firstName">First Name</Label>
                      <Input
                        id="reg-firstName"
                        placeholder="First Name"
                        {...registerRegister("firstName")}
                        className="pl-4 rounded-full border-[#00C2FF] focus:border-[#00C2FF] focus:ring-[#00C2FF]/20 h-12"
                      />
                      {registerErrors.firstName && <p className="text-xs text-red-500 pl-4">{registerErrors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-lastName">Last Name</Label>
                      <Input
                        id="reg-lastName"
                        placeholder="Last Name"
                        {...registerRegister("lastName")}
                        className="pl-4 rounded-full border-[#2DD4BF] focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-12"
                      />
                      {registerErrors.lastName && <p className="text-xs text-red-500 pl-4">{registerErrors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email Address</Label>
                    <Input
                      id="reg-email"
                      placeholder="Enter your Email Address"
                      {...registerRegister("email")}
                      className="pl-4 rounded-full border-[#2DD4BF] focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-12"
                    />
                    {registerErrors.email && <p className="text-xs text-red-500 pl-4">{registerErrors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create Password"
                        {...registerRegister("password")}
                        className="pl-4 pr-10 rounded-full border-[#2DD4BF] focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {registerErrors.password && <p className="text-xs text-red-500 pl-4">{registerErrors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirmPassword">Confirm Password</Label>
                    <Input
                      id="reg-confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      {...registerRegister("confirmPassword")}
                      className="pl-4 rounded-full border-[#2DD4BF] focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 h-12"
                    />
                    {registerErrors.confirmPassword && <p className="text-xs text-red-500 pl-4">{registerErrors.confirmPassword.message}</p>}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-40 rounded-full bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:opacity-90 text-white shadow-lg h-12 text-base font-normal border-0"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "Register"}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetStep === 'request'
                ? "Enter your email address to receive a verification code."
                : "Enter the code sent to your email and your new password."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {resetStep === 'request' ? (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password (OTP)</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Check your server console for the OTP.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>Cancel</Button>
            {resetStep === 'request' ? (
              <Button onClick={handleForgotPassword} disabled={isLoading} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:opacity-90 text-white border-0">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            ) : (
              <Button onClick={handleResetPassword} disabled={isLoading} className="bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] hover:opacity-90 text-white border-0">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}