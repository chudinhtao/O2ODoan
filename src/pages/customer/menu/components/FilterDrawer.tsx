import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, ArrowUpDown, SlidersHorizontal, Flame, CheckCircle2 } from 'lucide-react'

export type SortType = 'price-asc' | 'price-desc' | 'recommended' | 'none'

export interface FilterState {
  sortBy: SortType
  onlyFeatured: boolean
  onlyAvailable: boolean
}

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onApply: (filters: FilterState) => void
}

export function FilterDrawer({ isOpen, onClose, filters, onApply }: FilterDrawerProps) {
  const { t } = useTranslation()

  const handleReset = () => {
    onApply({ sortBy: 'none', onlyFeatured: false, onlyAvailable: false })
    onClose()
  }

  const SORT_OPTIONS: { id: SortType; label: string }[] = [
    { id: 'none',       label: t('customer.menu.sortRecommended', 'Mặc định (Nổi bật)') },
    { id: 'price-asc',  label: t('customer.menu.sortPriceAsc',   'Giá: Thấp đến Cao') },
    { id: 'price-desc', label: t('customer.menu.sortPriceDesc',  'Giá: Cao đến Thấp') },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[80] backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 bg-[#f8fafc] rounded-t-[32px] shadow-2xl z-[90] flex flex-col font-sans max-h-[85vh] overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <h2 className="font-black text-[17px] text-slate-900">
                {t('customer.menu.filterTitle', 'Bộ lọc & Sắp xếp')}
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 active:scale-90 transition-all"
              >
                <X size={17} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

              {/* Sort section */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-50">
                  <ArrowUpDown size={16} className="text-guest-primary shrink-0" strokeWidth={2.5} />
                  <h4 className="font-black text-sm text-slate-800">
                    {t('customer.menu.sortBy', 'Sắp xếp theo')}
                  </h4>
                </div>
                <div className="divide-y divide-slate-50">
                  {SORT_OPTIONS.map(opt => {
                    const isSelected = filters.sortBy === opt.id
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors ${isSelected ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}
                      >
                        <span className={`text-sm font-medium ${isSelected ? 'text-guest-primary font-bold' : 'text-slate-700'}`}>
                          {opt.label}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-guest-primary bg-guest-primary' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <input type="radio" name="sortBy" value={opt.id} checked={isSelected}
                          onChange={() => onApply({ ...filters, sortBy: opt.id })}
                          className="hidden"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Quick filter section */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-50">
                  <SlidersHorizontal size={16} className="text-guest-primary shrink-0" strokeWidth={2.5} />
                  <h4 className="font-black text-sm text-slate-800">
                    {t('customer.menu.quickFilter', 'Lọc nhanh')}
                  </h4>
                </div>

                {/* Featured toggle */}
                <label className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Flame size={16} fill="#f59e0b" className="text-amber-400 shrink-0" />
                    <span className={`text-sm font-medium ${filters.onlyFeatured ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                      {t('customer.menu.filterFeatured', 'Chỉ hiện món HOT')}
                    </span>
                  </div>
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${filters.onlyFeatured ? 'bg-guest-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${filters.onlyFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <input type="checkbox" checked={filters.onlyFeatured} onChange={e => onApply({ ...filters, onlyFeatured: e.target.checked })} className="hidden" />
                </label>

                {/* Available toggle */}
                <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" strokeWidth={2.5} />
                    <span className={`text-sm font-medium ${filters.onlyAvailable ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                      {t('customer.menu.filterAvailable', 'Chỉ hiện món còn hàng')}
                    </span>
                  </div>
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${filters.onlyAvailable ? 'bg-guest-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${filters.onlyAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <input type="checkbox" checked={filters.onlyAvailable} onChange={e => onApply({ ...filters, onlyAvailable: e.target.checked })} className="hidden" />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pt-3 pb-8 border-t border-slate-100 bg-white flex gap-3 shrink-0">
              <button
                onClick={handleReset}
                className="flex-1 h-12 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                {t('customer.menu.reset', 'Thiết lập lại')}
              </button>
              <button
                onClick={onClose}
                className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white font-bold text-sm shadow-[0_4px_16px_-4px_rgba(255,105,51,0.5)] active:scale-[0.98] transition-all"
              >
                {t('customer.menu.applyFilter', 'Áp dụng')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
