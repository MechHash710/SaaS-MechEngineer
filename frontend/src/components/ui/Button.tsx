import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, fullWidth = false, icon, children, disabled, ...props }, ref) => {
    
    // Variant styles
    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm border border-transparent",
      secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent",
    }

    // Size styles
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 py-3 text-base",
    }

    const stateDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={stateDisabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          variants[variant],
          sizes[size],
          fullWidth ? "w-full flex" : "inline-flex",
          stateDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
