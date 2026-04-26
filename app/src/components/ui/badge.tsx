import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'kuliner' | 'blue'
  className?: string
}

const variantClasses = {
  default: 'bg-purple-600 text-white',
  secondary: 'bg-gray-100 text-gray-700',
  outline: 'border border-purple-100 text-purple-600 bg-purple-50/50',
  destructive: 'bg-red-50 text-red-600 border border-red-100',
  success: 'bg-green-50 text-green-600 border border-green-100',
  warning: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
  kuliner: 'bg-orange-50 text-orange-600 border border-orange-100',
  blue: 'bg-blue-50 text-blue-600 border border-blue-100',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
        className
      )}
    >
      {children}
    </span>
  )
}
