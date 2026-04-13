import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setLanguage } from '@/store/slices/ui.slice'

interface ILanguageToggleProps {
  /** Extra classes — override positioning, color, etc. */
  className?: string
  /**
   * pill  → bordered pill chip with active highlight (Login page, settings)
   * plain → minimal text-only toggle (sidebar contexts)
   */
  variant?: 'pill' | 'plain'
}

/**
 * VI/EN language toggle.
 * Persists via Redux (ui.slice) and syncs i18next immediately.
 */
export function LanguageToggle({ className = '', variant = 'plain' }: ILanguageToggleProps) {
  const { t, i18n } = useTranslation()
  const dispatch  = useAppDispatch()
  const language  = useAppSelector(state => state.ui.language)

  const toggle = () => {
    const next = language === 'vi' ? 'en' : 'vi'
    dispatch(setLanguage(next))
    i18n.changeLanguage(next)
  }

  if (variant === 'pill') {
    return (
      <button
        id="language-toggle-btn"
        onClick={toggle}
        title={t('common.switchLanguage')}
        className={`flex items-center gap-1 rounded-full border border-outline-variant/50 bg-surface/80 backdrop-blur-sm px-3 py-1.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md ${className}`}
      >
        <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
          language === 'vi' ? 'text-primary' : 'text-on-surface-variant/40'
        }`}>VI</span>
        <span className="text-outline-variant text-[10px] leading-none">|</span>
        <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
          language === 'en' ? 'text-primary' : 'text-on-surface-variant/40'
        }`}>EN</span>
      </button>
    )
  }

  // plain variant — dùng trong sidebar
  return (
    <button
      id="language-toggle-btn"
      onClick={toggle}
      title={t('common.switchLanguage')}
      className={`flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest transition-all ${className}`}
    >
      <span className={language === 'vi' ? 'opacity-100' : 'opacity-30'}>VI</span>
      <span className="opacity-20 mx-0.5">|</span>
      <span className={language === 'en' ? 'opacity-100' : 'opacity-30'}>EN</span>
    </button>
  )
}
