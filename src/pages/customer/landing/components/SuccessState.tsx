import { useTranslation } from 'react-i18next'

export function SuccessState() {
  const { t } = useTranslation()
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('customer.support.requestSent')}</h3>
      <p className="text-slate-500 text-sm">{t('customer.support.staffWillArrive')}</p>
    </div>
  )
}
