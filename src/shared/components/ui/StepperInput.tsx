import { Plus, Minus } from 'lucide-react'
import { Button } from './Button'

interface StepperInputProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  className?: string
  variant?: 'guest' | 'admin'
}

export function StepperInput({ value, onChange, min = 0, max = 99, className = '', variant = 'guest' }: StepperInputProps) {
  const handleDecrement = () => {
    onChange(Math.max(min, value - 1))
  }

  const handleIncrement = () => {
    onChange(Math.min(max, value + 1))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      // Temporary empty state handled by parent, or default to min
      onChange(min)
      return
    }
    const num = parseInt(val, 10)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  const handleBlur = () => {
    if (value < min) onChange(min)
    if (value > max) onChange(max)
  }

  return (
    <div className={`flex items-center gap-1.5 bg-surface-subtle p-1 rounded-full border border-surface-border ${className}`}>
      <Button
        type="button"
        variant="ghost"
        onClick={handleDecrement}
        disabled={value <= min}
        className={`!w-7 !h-7 !min-w-0 !p-0 !rounded-full shrink-0 disabled:!opacity-40 disabled:!bg-slate-100 disabled:!text-slate-400 ${
          variant === 'guest' 
            ? '!bg-guest-primary/10 !text-guest-primary hover:!bg-guest-primary/20' 
            : '!bg-blue-100 !text-blue-600 hover:!bg-blue-200'
        }`}
      >
        <Minus size={14} />
      </Button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="font-extrabold text-sm w-7 text-center bg-transparent outline-none border-none p-0 text-text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant={variant === 'guest' ? 'guest' : 'primary'}
        onClick={handleIncrement}
        disabled={value >= max}
        className={`!w-7 !h-7 !min-w-0 !p-0 !rounded-full shrink-0 disabled:!opacity-40 disabled:!bg-slate-100 disabled:!text-slate-400 shadow-sm ${
          variant === 'admin' ? '!bg-blue-600 hover:!bg-blue-700' : ''
        }`}
      >
        <Plus size={14} />
      </Button>
    </div>
  )
}
