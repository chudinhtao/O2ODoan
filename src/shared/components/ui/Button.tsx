import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon' | 'guest'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = ({
  children,
  isLoading,
  variant = 'primary',
  size = 'default',
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow active:shadow-none',
    secondary: 'bg-secondary hover:bg-secondary/80 text-white shadow-sm',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700 bg-transparent shadow-none',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
    icon: 'text-slate-600 bg-transparent hover:bg-slate-100',
    guest: 'bg-guest-primary hover:bg-guest-primary/90 text-white shadow-md shadow-guest-primary/15'
  }
  
  const sizes = {
    default: 'text-sm font-semibold py-2 px-3.5 rounded-lg',
    lg: 'text-sm font-bold py-2.5 px-5 rounded-xl',
    sm: 'text-xs font-semibold py-1.5 px-3 rounded-lg',
    icon: 'p-2 rounded-lg'
  }

  return (
    <button
      className={`active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Đang xử lý...</span>
        </>
      ) : children}
    </button>
  )
}
