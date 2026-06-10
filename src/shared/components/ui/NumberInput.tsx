import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: FieldError
  prefix?: string
  suffix?: string
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, prefix, suffix, className, ...props }, ref) => {
    const { t } = useTranslation()
    
    return (
      <div className="space-y-1 w-full text-left">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-stretch shadow-sm rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors group">
          {prefix && (
            <span className="flex items-center px-3 bg-slate-50 border-r border-slate-200 text-slate-500 font-semibold text-sm">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            className={[
              'w-full py-2.5 px-3 bg-transparent text-sm outline-none transition-all text-slate-800 font-medium',
              error ? 'bg-red-50/50' : '',
              props.disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-text',
              className || ''
            ].join(' ')}
            onKeyDown={(e) => {
              if (
                !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.', '-'].includes(e.key) &&
                !e.ctrlKey && !e.metaKey &&
                !/^[0-9]$/.test(e.key)
              ) {
                e.preventDefault()
              }
              props.onKeyDown?.(e)
            }}
            {...props}
          />

          {suffix && (
            <span className="flex items-center px-3 bg-slate-50 border-l border-slate-200 text-slate-500 font-semibold text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 ml-1 mt-1 font-medium">{t(error.message || '')}</p>
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'

