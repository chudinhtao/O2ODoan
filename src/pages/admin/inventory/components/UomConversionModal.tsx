import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Trash2, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { useUoms, useUomConversions } from '../hooks/useInventoryQueries'
import { useConversionMutations } from '../hooks/useInventoryMutations'
import { IInventoryItem, IUomConversionRequest } from '../types/inventory.type'
import { toast } from 'sonner'

interface UomConversionModalProps {
  isOpen: boolean
  onClose: () => void
  item: IInventoryItem
}

export default function UomConversionModal({ isOpen, onClose, item }: UomConversionModalProps) {
  const { t } = useTranslation()

  const { data: uoms = [] } = useUoms()
  const { data: conversions = [], isLoading } = useUomConversions(item?.id)
  const { create, remove } = useConversionMutations()

  const [isAdding, setIsAdding] = useState(false)
  const [newConversion, setNewConversion] = useState<IUomConversionRequest>({
    itemId: item?.id || '',
    fromUomId: '',
    toUomId: item?.baseUom?.id || '',
    conversionRate: 1,
  })

  if (!isOpen || !item) return null

  const handleAdd = () => {
    if (!newConversion.fromUomId) {
      toast.error(t('admin.inventory.conversion.errorFromUom'))
      return
    }
    if (!newConversion.toUomId) {
      toast.error(t('admin.inventory.conversion.errorToUom'))
      return
    }
    if (newConversion.fromUomId === newConversion.toUomId) {
      toast.error(t('admin.inventory.conversion.errorSameUom'))
      return
    }
    if (newConversion.conversionRate <= 0) {
      toast.error(t('admin.inventory.conversion.errorRate'))
      return
    }

    create.mutate(
      { ...newConversion, itemId: item.id },
      {
        onSuccess: () => {
          setIsAdding(false)
          setNewConversion({
            itemId: item.id,
            fromUomId: '',
            toUomId: item.baseUom?.id || '',
            conversionRate: 1,
          })
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    if (confirm(t('admin.inventory.conversion.confirmDelete'))) {
      remove.mutate(id)
    }
  }

  const getUomName = (id: string) => uoms.find(u => u.id === id)?.name || id


  const availableFromUoms = uoms.filter(u => u.id !== item.baseUom?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[650px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              {t('admin.inventory.conversion.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.name} — {t('admin.inventory.conversion.baseUnit')}: <span className="font-semibold text-primary">{item.baseUom?.name || '—'}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Existing conversions */}
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">{t('admin.inventory.conversion.loading')}</div>
          ) : conversions.length === 0 && !isAdding ? (
            <div className="text-center py-10 text-slate-400">
              <RefreshCw className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-500">{t('admin.inventory.conversion.empty')}</p>
              <p className="text-sm mt-1">{t('admin.inventory.conversion.emptyDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversions.map(conv => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 group hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      1 {conv.fromUom.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
                      {conv.conversionRate} {conv.toUom.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title={t('common.delete', 'Xóa')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new conversion form */}
          {isAdding && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50 space-y-3">
              <p className="text-sm font-semibold text-slate-700">{t('admin.inventory.conversion.addNewTitle')}</p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('admin.inventory.conversion.fromUnitLabel')}</label>
                  <Select
                    value={newConversion.fromUomId}
                    onChange={e => setNewConversion({ ...newConversion, fromUomId: e.target.value as string })}
                    options={[
                      { value: '', label: t('admin.inventory.conversion.selectPlaceholder') },
                      ...availableFromUoms.map(u => ({ value: u.id, label: `${u.name} (${u.shortName})` })),
                    ]}
                  />
                </div>
                <div className="flex items-center pb-1 text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="w-28">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('admin.inventory.conversion.rateLabel')}</label>
                  <NumberInput
                    value={newConversion.conversionRate}
                    onChange={e => setNewConversion({ ...newConversion, conversionRate: Number(e.target.value) })}
                    min={0.001}
                    step={1}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('admin.inventory.conversion.toUnitLabel')}</label>
                  <Select
                    value={newConversion.toUomId}
                    onChange={e => setNewConversion({ ...newConversion, toUomId: e.target.value as string })}
                    options={uoms.map(u => ({ value: u.id, label: `${u.name} (${u.shortName})` }))}
                    disabled={true}
                  />
                </div>
              </div>
              {/* Preview */}
              {newConversion.fromUomId && newConversion.toUomId && newConversion.conversionRate > 0 && (
                <div className="bg-white rounded-lg px-3 py-2 text-sm text-slate-600 border border-slate-200">
                  📐 <strong>1 {getUomName(newConversion.fromUomId)}</strong> = <strong className="text-primary">{newConversion.conversionRate} {getUomName(newConversion.toUomId)}</strong>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setIsAdding(false)} className="!py-1.5 !px-3 !text-sm">
                  {t('admin.inventory.conversion.cancel')}
                </Button>
                <Button onClick={handleAdd} disabled={create.isPending} className="!py-1.5 !px-4 !text-sm">
                  {create.isPending ? t('admin.inventory.conversion.saving') : t('admin.inventory.conversion.confirm')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setIsAdding(true)
              setNewConversion({
                itemId: item.id,
                fromUomId: '',
                toUomId: item.baseUom?.id || '',
                conversionRate: 1,
              })
            }}
            disabled={isAdding}
            className="!py-2 !px-4 !text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> {t('admin.inventory.conversion.addNew')}
          </Button>
          <Button variant="outline" onClick={onClose} className="!py-2 !px-4 !text-sm">
            {t('admin.inventory.conversion.close')}
          </Button>
        </div>
      </div>
    </div>
  )
}
