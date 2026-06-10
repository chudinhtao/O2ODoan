import { useState, useEffect, useRef } from 'react'
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../../hooks/useDebounce'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

export interface ISelectOption {
  label: string
  value: string | number
  [key: string]: any // allow extra data
}

interface AsyncSelectProps {
  value: string | number
  onChange: (value: string | number, option?: ISelectOption) => void
  onSearch: (keyword: string) => void
  options: ISelectOption[]
  isLoading?: boolean
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  debounceMs?: number
  className?: string
  totalElements?: number
}

export function AsyncSelect({
  value,
  onChange,
  onSearch,
  options,
  isLoading = false,
  label,
  placeholder = 'Tìm kiếm...',
  disabled = false,
  error,
  debounceMs = 300,
  className = '',
  totalElements
}: AsyncSelectProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [isOpen])

  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => {
    setIsOpen(false)
    setSearchTerm('')
  })

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

  useEffect(() => {
    if (isOpen) {
      onSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectOption = (opt: ISelectOption) => {
    onChange(opt.value, opt)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
  }

  const currentOption = options.find((o) => String(o.value) === String(value))

  return (
    <div className="space-y-1 w-full text-left" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full py-2 pr-8 pl-3 bg-white border rounded-lg text-sm text-slate-800 shadow-sm transition-all focus:outline-none flex items-center justify-between text-left min-h-[40px]
            ${error ? 'border-red-500 ring-2 ring-red-500/20' : isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'}
            ${disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-pointer'}
            ${className}
          `}
        >
          <span className={`block truncate ${!currentOption && !value ? '!text-slate-400 font-normal' : 'font-medium'}`}>
            {currentOption ? currentOption.label : (value ? t('common.loading', 'Đang tải...') : placeholder)}
          </span>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
            {value && !disabled && (
              <div 
                onClick={handleClear}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </div>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden filter drop-shadow-md animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-900"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
              {isLoading ? (
                <div className="flex items-center justify-center p-4 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('common.searching', 'Đang tìm kiếm...')}</span>
                </div>
              ) : options.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  {t('common.noResult', 'Không tìm thấy kết quả')}
                </div>
              ) : (
                <>
                  {options.map((opt) => {
                    const isSelected = String(opt.value) === String(value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between group 
                          ${isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'}
                        `}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    )
                  })}
                  {totalElements !== undefined && totalElements > 0 && (
                    <div className="p-2 text-center text-xs text-slate-500 border-t border-slate-100 mt-1">
                      {t('common.showingXofY', { x: options.length, y: totalElements, defaultValue: `Hiển thị ${options.length}/${totalElements}` })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  )
}
