import { useQuery } from '@tanstack/react-query'
import { Sparkles, ShoppingCart, AlertCircle, RefreshCw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { inventoryService } from '../../services/inventory.service'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { IPurchaseSuggestion } from '../../types/inventory.type'

interface PoSuggestionsModalProps {
  onClose: () => void
  onUseSuggestion: (suggestion: IPurchaseSuggestion) => void
}

export default function PoSuggestionsModal({ onClose, onUseSuggestion }: PoSuggestionsModalProps) {
  const { t } = useTranslation()
  const { data: suggestions, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'inventory', 'po-suggestions'],
    queryFn: () => inventoryService.getPurchaseSuggestions(),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t('admin.inventory.po.smart_suggestion_title')}</h3>
              <p className="text-sm text-slate-500">{t('admin.inventory.po.smart_suggestion_subtitle')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-6 h-6 text-slate-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : !suggestions || suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-emerald-500 opacity-20" />
              </div>
              <p className="text-lg font-bold text-slate-700">{t('admin.inventory.po.safe_stock_alert')}</p>
              <p className="text-sm text-slate-500 mt-1">{t('admin.inventory.po.safe_stock_desc')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">{t('admin.inventory.po.warning_low_stock', { count: suggestions.length })}</p>
                  <p className="text-xs text-amber-700/80">{t('admin.inventory.po.warning_low_stock_desc')}</p>
                </div>
              </div>

              {suggestions.map((item: IPurchaseSuggestion) => (
                <div key={item.itemId} className="group bg-white border border-slate-200 hover:border-primary/40 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{item.itemName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono uppercase">{item.itemSku}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span>{t('admin.inventory.po.item_current')}: <b className="text-slate-700">{item.currentStock} {item.uomName}</b></span>
                      <span>{t('admin.inventory.po.item_safety')}: <b className="text-slate-700">{item.safetyStock} {item.uomName}</b></span>
                      <span className="text-primary font-medium">{t('admin.inventory.po.item_supplier')}: {item.supplierName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">{t('admin.inventory.po.item_suggested_qty')}</div>
                      <div className="text-xl font-black text-primary">+{item.suggestedQuantity} <span className="text-xs font-normal opacity-60">{item.uomName}</span></div>
                    </div>
                    <Button 
                      onClick={() => onUseSuggestion(item)}
                      size="sm"
                      className="rounded-xl shadow-lg shadow-primary/20"
                    >
                      {t('admin.inventory.po.use_suggestion_btn')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {t('admin.inventory.po.refresh_data')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
