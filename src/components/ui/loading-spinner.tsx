import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          "animate-spin rounded-full border-t-[#00C2FF] border-r-[#00C2FF] border-b-transparent border-l-transparent",
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
}


export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function FullScreenLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800">
        {/* Logo/Brand accent */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00C2FF]/5 to-[#0A1A2F]/5 pointer-events-none" />

        {/* Spinner */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#00C2FF] border-r-[#0A1A2F] border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#00C2FF] to-[#0A1A2F] opacity-20 animate-pulse" />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center space-y-1 z-10">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00C2FF] to-[#0A1A2F] bg-clip-text text-transparent animate-pulse">
            TechSonance
          </h3>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}
