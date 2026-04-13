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
        <div className="relative flex items-stretch shadow-sm rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
          {prefix && (
            <span className="flex items-center px-4 bg-slate-50 border border-slate-200 border-r-0 rounded-l-xl text-slate-500 font-semibold text-sm">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type="number"
            className={[
              'w-full py-2.5 px-4 bg-transparent border text-sm outline-none transition-all text-slate-800',
              error ? 'border-red-500 ring-2 ring-red-500/20 z-10' : 'border-slate-200 hover:border-slate-300',
              props.disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-text relative',
              prefix ? (!suffix ? 'rounded-r-xl border-l-0' : 'border-x-0') : (!suffix ? 'rounded-xl' : 'rounded-l-xl border-r-0'),
              className || ''
            ].join(' ')}
            {...props}
          />
          {suffix && (
            <span className="flex items-center px-4 bg-slate-50 border border-slate-200 border-l-0 rounded-r-xl text-slate-500 font-semibold text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 ml-1">{t(error.message || '')}</p>
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'
