import { X, Package, CalendarDays, User, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { IPurchaseOrder } from '../../types/inventory.type'
import { PoStatusBadge } from './PoStatusBadge'
import { useStaff } from '../../../staff/hooks/useStaff'
import { IStaffProfile } from '../../../staff/types/staff.type'

interface PoDetailDrawerProps {
  po: IPurchaseOrder
  onClose: () => void
}

export default function PoDetailDrawer({ po, onClose }: PoDetailDrawerProps) {
  const { t, i18n } = useTranslation()
  const { staff } = useStaff()

  const getUserName = (id?: string | null) => {
    if (!id) return '—';
    const user = staff?.find((s: IStaffProfile) => s.id === id);
    return user ? user.fullName : id;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{po.poNumber}</h2>
              <p className="text-xs text-slate-500">{t('admin.inventory.po.detailTitle', 'Chi tiết Phiếu Nhập Kho')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Meta Info */}
        <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <MetaRow icon={<Package className="w-3.5 h-3.5" />} label={t('admin.inventory.po.colSupplier', 'Nhà cung cấp')} value={po.supplierName ?? '—'} />
          <MetaRow icon={null} label={t('admin.inventory.po.colStatus', 'Trạng thái')} value={<PoStatusBadge status={po.status} />} />
          <MetaRow icon={<CalendarDays className="w-3.5 h-3.5" />} label={t('admin.inventory.po.colDate', 'Ngày tạo')} value={new Date(po.createdAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} />
          {po.confirmedAt && (
            <MetaRow icon={<CalendarDays className="w-3.5 h-3.5" />} label={t('admin.inventory.po.confirmedAt', 'Ngày chốt')} value={new Date(po.confirmedAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} />
          )}
          <MetaRow icon={<User className="w-3.5 h-3.5" />} label={t('admin.inventory.po.createdBy', 'Người tạo')} value={getUserName(po.createdBy)} />
          {po.notes && <MetaRow icon={null} label={t('admin.inventory.po.notesLabel', 'Ghi chú')} value={po.notes} />}
        </div>

        {/* Items Table */}
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {t('admin.inventory.po.itemsList', 'Danh sách mặt hàng')} ({po.items.length})
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colItem', 'Mặt hàng')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colOrdered', 'Đặt')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colReceived', 'Đã nhận')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colRemaining', 'Còn thiếu')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colPrice', 'Đơn giá')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colTotal', 'Thành tiền')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {po.items.map((item) => {
                  const isFullyReceived = item.remainingQuantity === 0
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.itemName}</div>
                        <div className="text-xs text-slate-400">{item.uomName} {item.batchNumber ? `· ${item.batchNumber}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">{item.orderedQuantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{item.receivedQuantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={isFullyReceived ? 'text-emerald-500 font-medium' : 'text-orange-500 font-medium'}>
                          {item.remainingQuantity.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.unitPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{item.totalLineAmount?.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500 tracking-wider">
                    {t('admin.inventory.po.total', 'Tổng cộng')}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800 text-base">
                    {po.totalAmount?.toLocaleString()} {t('common.currency', 'đ')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
        {icon}{label}
      </div>
      <div className="text-sm font-medium text-slate-700">{value}</div>
    </div>
  )
}
