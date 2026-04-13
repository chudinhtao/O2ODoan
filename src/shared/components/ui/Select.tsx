import { Check, ChevronDown } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export interface SelectOption {
  label: string
  value: string | number
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label?: string
  error?: FieldError
  options?: SelectOption[]
  icon?: React.ReactNode
  placement?: 'top' | 'bottom'
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, children, onChange, onBlur, name, disabled, placement = 'bottom', ...props }, ref) => {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState<string | number>((props.defaultValue as string | number) || (props.value as string | number) || '')
    const containerRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLSelectElement | null>(null)

    // Merge refs so react-hook-form gets the DOM node
    const setRefs = (node: HTMLSelectElement | null) => {
      selectRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as any).current = node
      }
    }

    // Intercept programmatic value changes on the native select (e.g. from RHF reset())
    useEffect(() => {
      const node = selectRef.current
      if (!node) return

      const descriptor = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')
      if (descriptor && descriptor.set) {
        const originalSet = descriptor.set
        Object.defineProperty(node, 'value', {
          configurable: true,
          get() {
            return descriptor.get?.call(node)
          },
          set(val) {
            originalSet.call(node, val)
            setSelectedValue(val)
          }
        })
      }
      
      // Load initial value
      setSelectedValue(node.value)

      return () => {
        // Remove the overridden instance property so it falls back to the prototype
        delete (node as any).value
      }
    }, [options]) // re-run if options change because initial value might resolve then

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelectOption = (val: string | number) => {
      setSelectedValue(val)
      setIsOpen(false)
      if (selectRef.current) {
        selectRef.current.value = String(val)
      }
      // trigger react-hook-form onChange manually
      onChange?.({
        target: { name, value: val },
        type: 'change'
      } as any)
    }

    const currentOption = options?.find((o) => String(o.value) === String(selectedValue))

    return (
      <div className="space-y-1 w-full text-left relative" ref={containerRef}>
        {label && (
          <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
            {label}
          </label>
        )}
        
        {/* Hidden Native Select for RHF Control */}
        <select
          ref={setRefs}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className="sr-only" // screen reader only
          {...props}
        >
          {options ? (
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>

        {/* Custom Dropdown Trigger UI */}
        <div className="relative">
          {props.icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
              {props.icon}
            </div>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={[
              'w-full py-2.5 pr-10 bg-white border rounded-xl text-sm shadow-sm transition-all focus:outline-none flex items-center justify-between text-left',
              props.icon ? 'pl-9' : 'pl-4',
              error ? 'border-red-500 ring-2 ring-red-500/20' : isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200',
              disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-pointer hover:border-slate-300',
              className || ''
            ].join(' ')}
          >
            <span className={`block truncate ${!currentOption ? 'text-slate-400' : 'text-slate-800'}`}>
              {currentOption ? currentOption.label : '...'}
            </span>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>
          
          {/* Custom Dropdown Options Menu */}
          {isOpen && options && (
            <div className={`absolute ${placement === 'top' ? 'bottom-[calc(100%+4px)] origin-bottom' : 'top-[calc(100%+4px)] origin-top'} left-0 z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-2 max-h-60 overflow-y-auto filter drop-shadow-md animate-in fade-in zoom-in-95 duration-100`}>
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(selectedValue)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group 
                      ${isSelected ? 'bg-primary/5 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-red-500 ml-1">{t(error.message || '')}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
