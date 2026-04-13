import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-error text-on-error hover:bg-error/90 ring-error/20'
      case 'warning':
        return 'bg-amber-500 text-white hover:bg-amber-600 ring-amber-500/20'
      case 'info':
        return 'bg-primary text-on-primary hover:bg-primary/90 ring-primary/20'
    }
  }

  const getVariantIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-7 h-7 text-error" />
      case 'warning':
        return <AlertCircle className="w-7 h-7 text-amber-500" />
      case 'info':
        return <Info className="w-7 h-7 text-primary" />
    }
  }

  const getVariantBg = () => {
    switch (variant) {
      case 'danger': return 'bg-error/10'
      case 'warning': return 'bg-amber-500/10'
      case 'info': return 'bg-primary/10'
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onCancel()}
      />
      
      {/* Modal Box */}
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden animate-slide-up-fade">
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getVariantBg()}`}>
              {getVariantIcon()}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-on-surface">
                {title}
              </h3>
              <p className="text-sm font-medium text-on-surface/60 whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-on-surface/5 flex gap-3 border-t border-outline-variant/50">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl font-bold cursor-pointer text-on-surface/70 bg-surface hover:bg-on-surface/5 transition-colors border border-outline-variant disabled:opacity-50"
          >
            {cancelText || t('common.cancel') || 'Hủy'}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold cursor-pointer shadow-md ring-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()}`}
          >
            {isLoading && <Loader2 className="w-[18px] h-[18px] animate-spin" />}
            {confirmText || t('common.confirm') || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}
