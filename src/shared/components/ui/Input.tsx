import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelClassName?: string
  error?: FieldError
  icon?: ReactNode
  rightAddon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName, error, icon, rightAddon, className, ...props }, ref) => {
    const { t } = useTranslation()
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className={`block text-sm font-semibold ml-1 mb-1.5 ${labelClassName || 'text-slate-700'}`}>
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={[
              'w-full py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all',
              props.disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-text hover:border-slate-300',
              icon ? 'pl-12' : 'px-4',
              rightAddon ? 'pr-12' : icon ? 'pr-4' : '',
              error ? 'ring-2 ring-error' : '',
              className || ''
            ].join(' ')}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-error ml-1">{t(error.message || '')}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
