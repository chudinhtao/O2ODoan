import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: FieldError
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative group">
          <textarea
            ref={ref}
            className={[
              'w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none min-h-20',
              props.disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-text hover:border-slate-300',
              error ? 'ring-2 ring-error' : '',
              className || ''
            ].join(' ')}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error ml-1">{error.message}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
