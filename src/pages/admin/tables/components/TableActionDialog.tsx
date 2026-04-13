import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft, Merge } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useMergeTable, useTransferTable } from '../hooks/useTables'
import type { ITable } from '../types/adminTable.type'

type ActionMode = 'merge' | 'transfer'

interface TableActionDialogProps {
  isOpen: boolean
  mode: ActionMode
  sourceTable: ITable
  allTables: ITable[]
  onClose: () => void
}

export function TableActionDialog({ isOpen, mode, sourceTable, allTables, onClose }: TableActionDialogProps) {
  const { t } = useTranslation()
  const [targetId, setTargetId] = useState('')
  // merge: cả 2 bàn phải OCCUPIED | transfer: source OCCUPIED, target FREE
  const mergeMutation    = useMergeTable()
  const transferMutation = useTransferTable()

  if (!isOpen) return null

  const mutation = mode === 'merge' ? mergeMutation : transferMutation
  // Bàn đích hợp lệ theo từng mode:
  // merge   → target phải OCCUPIED (cả 2 bàn đang có khách)
  // transfer → target phải FREE    (chuyển sang bàn trống)
  const eligibleTargets = allTables.filter((tb) => {
    if (tb.id === sourceTable.id) return false
    return mode === 'merge' ? tb.status === 'OCCUPIED' : tb.status === 'FREE'
  })

  const handleConfirm = () => {
    if (!targetId) return
    mutation.mutate({ sourceTableId: sourceTable.id, targetTableId: targetId }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${mode === 'merge' ? 'bg-indigo-50' : 'bg-amber-50'}`}>
            {mode === 'merge'
              ? <Merge className="w-6 h-6 text-indigo-600" />
              : <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            }
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {mode === 'merge' ? t('admin.tables.action.mergeTitle') : t('admin.tables.action.transferTitle')}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.tables.action.sourceLabel')}: <span className="font-bold text-slate-800">#{sourceTable.number}</span>
          </p>
        </div>

        {/* Target selection */}
        <div className="p-6 space-y-3">
          <label className="block text-sm font-bold text-slate-700">
            {t('admin.tables.action.targetLabel')}
          </label>
          {eligibleTargets.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              {t('admin.tables.action.noEligibleTarget')}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {eligibleTargets.map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setTargetId(tb.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    targetId === tb.id
                      ? 'border-primary bg-primary/5 text-primary font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="font-black text-lg">#{tb.number}</span>
                  {tb.name && <p className="text-[10px] truncate mt-0.5">{tb.name}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-200">
          <Button
            isLoading={mutation.isPending}
            disabled={!targetId}
            onClick={handleConfirm}
            className="flex-1 !py-2.5 !text-sm !rounded-xl"
          >
            {t('common.confirm')}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 !py-2.5 !text-sm !rounded-xl">
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
