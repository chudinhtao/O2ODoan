import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'

export const SUPPORT_TYPES = [
  { id: 'CALL', label: 'customer.support.call', icon: 'waving_hand' },
  { id: 'ICE', label: 'customer.support.ice', icon: 'ac_unit' },
  { id: 'TISSUE', label: 'customer.support.tissue', icon: 'receipt_long' },
  { id: 'UTENSIL', label: 'customer.support.utensil', icon: 'restaurant' },
  { id: 'CLEAN', label: 'customer.support.clean', icon: 'cleaning_services' },
  { id: 'OTHER', label: 'customer.support.other', icon: 'help' },
]

export function SupportGrid({ selectedType, setSelectedType }: { selectedType: string, setSelectedType: (type: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-4 px-4 pb-6">
      {SUPPORT_TYPES.map(type => (
        <Button
          key={type.id}
          variant="outline"
          onClick={() => setSelectedType(type.id)}
          className={`relative h-auto flex flex-col items-center justify-center p-4 rounded-xl transition-all aspect-video ${selectedType === type.id
              ? '!border-guest-primary !bg-guest-primary/10'
              : 'border-slate-100 hover:border-slate-300'
            }`}
        >
          {selectedType === type.id && (
            <div className="absolute top-2 right-2 bg-guest-primary text-white rounded-full p-0.5 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm font-bold">check</span>
            </div>
          )}
          <span className={`material-symbols-outlined text-4xl mb-2 ${selectedType === type.id ? 'text-guest-primary' : 'text-slate-600'}`}>{type.icon}</span>
          <p className={`font-bold text-center text-sm ${selectedType === type.id ? 'text-guest-primary' : 'text-slate-700'}`}>
            {t(type.label)}
          </p>
        </Button>
      ))}
    </div>
  )
}

