import { X, Coffee, ChefHat } from 'lucide-react'
import { ITicketItemRequest } from '@/pages/customer/menu/types'
import { Button } from '@/shared/components/ui/Button'
import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { useTranslation } from 'react-i18next'

interface PreOrderDraftModalProps {
  isOpen: boolean
  onClose: () => void
  draftJson?: string | null
  menuItems: IMenuItem[]
}

export function PreOrderDraftModal({ isOpen, onClose, draftJson, menuItems }: PreOrderDraftModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  let parsedItems: ITicketItemRequest[] = []
  try {
    if (draftJson) {
      parsedItems = JSON.parse(draftJson)
    }
  } catch (e) {
    console.error("Invalid preOrderDraft JSON", e)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <ChefHat className="text-blue-500" size={20} />
            <h2 className="font-black text-lg">{t('pos.reservations.preorder.detailTitle', 'Chi tiết món đặt trước')}</h2>
          </div>
          <Button 
            variant="icon"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 rounded-full p-1.5"
          >
            <X size={18} strokeWidth={2.5} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {parsedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
              <Coffee size={48} className="text-slate-200" />
              <p className="font-medium text-sm">{t('pos.reservations.preorder.emptyDetails', 'Không có món ăn nào được chọn trước.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parsedItems.map((reqItem, idx) => {
                const menuItem = menuItems.find(m => m.id === reqItem.menuItemId)
                const itemName = menuItem?.name || t('pos.reservations.preorder.unknownItem', 'Món ăn không xác định')
                
                const optionNames: string[] = []
                if (reqItem.options && menuItem?.optionGroups) {
                  const allMenuOpts = menuItem.optionGroups.flatMap(g => g.options)
                  reqItem.options.forEach(reqOpt => {
                    const match = allMenuOpts.find(o => o.id === reqOpt.optionId)
                    if (match) optionNames.push(match.name)
                  })
                }

                return (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-black flex items-center justify-center shrink-0">
                      {reqItem.quantity}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-[15px]">{itemName}</h4>
                      {optionNames.length > 0 && (
                        <p className="text-[12px] text-slate-500 mt-1 font-medium bg-slate-50 inline-block px-2 py-0.5 rounded">
                          {optionNames.join(', ')}
                        </p>
                      )}
                      {reqItem.note && (
                        <div className="text-xs text-orange-600 italic bg-orange-50 px-2 py-1 rounded-md w-fit mt-1.5">
                          {t('pos.reservations.preorder.noteLabel', 'Ghi chú: {{note}}', { note: reqItem.note })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-orange-50/50 p-4 px-6 border-t border-slate-100 flex flex-col gap-3 shrink-0">
          <p className="text-xs text-orange-600/80 leading-relaxed max-w-lg">
            {t('pos.reservations.preorder.autoPrintNotice', '* Các món này sẽ được tự động thêm vào giỏ và in phiếu xuống bếp ngay khi bạn bấm Nhận bàn.')}
          </p>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose} className="px-6 rounded-xl">
              {t('common.action.close', 'Đóng')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
