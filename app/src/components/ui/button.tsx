import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const variantClasses = {
  primary: 'btn-primary text-white font-semibold rounded-xl px-6 py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60',
  secondary: 'bg-gray-100 text-gray-700 font-semibold rounded-xl px-6 py-3 hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60',
  outline: 'border-2 border-purple-600 text-purple-600 font-semibold rounded-xl px-6 py-3 hover:bg-purple-50 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60',
  ghost: 'text-gray-600 font-medium rounded-xl px-4 py-2 hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60',
  whatsapp: 'btn-whatsapp font-semibold rounded-xl px-6 py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60',
  destructive: 'bg-red-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60',
}

const sizeClasses = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base',
  lg: 'text-lg px-8 py-4',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
