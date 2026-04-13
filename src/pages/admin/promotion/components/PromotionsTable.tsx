import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { TicketPercent, Edit, Trash2, Percent, Banknote, Zap, RotateCcw, ShieldBan } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { SkeletonTable } from '@/shared/components/ui/Skeleton'
import type { IPromotion } from '../types/adminPromotion.type'

interface PromotionsTableProps {
  data: IPromotion[]
  isLoading: boolean
  variant?: 'voucher' | 'flash_sale'
  startIndex?: number
  onEdit: (promotion: IPromotion) => void
  onDelete: (id: string, name: string) => void
  onRestore: (id: string) => void
  onHardDelete: (id: string, name: string) => void
}

export function PromotionsTable({ data, isLoading, variant = 'voucher', startIndex = 0, onEdit, onDelete, onRestore, onHardDelete }: PromotionsTableProps) {
  const { t } = useTranslation()
  if (isLoading) {
    return <SkeletonTable rows={5} cols={9} />
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PERCENT':
        return {
          label: t('admin.promotion.type.percent', 'Phần trăm'),
          icon: <Percent className="w-3 h-3 mr-1" />,
          cls: 'bg-primary/10 text-primary border border-primary/20'
        }
      case 'AMOUNT':
        return {
          label: t('admin.promotion.type.amount', 'Số tiền'),
          icon: <Banknote className="w-3 h-3 mr-1" />,
          cls: 'bg-secondary/10 text-secondary border border-secondary/20'
        }
      case 'FLASH_SALE':
        return {
          label: t('admin.promotion.tabs.flashSales', 'Flash Sale'),
          icon: <Zap className="w-3 h-3 mr-1" />,
          cls: 'bg-tertiary/10 text-tertiary border border-tertiary/30'
        }
      default:
        return { label: type, icon: null, cls: 'bg-surface-container text-on-surface-variant border border-outline-variant' }
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

  const formatValue = (value: number, type: string) => {
    if (type === 'PERCENT') return `${value}%`
    if (type === 'AMOUNT' || type === 'AUTO') return `${fmt(value)}đ`
    return value.toString()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm dd/MM/yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">{t('admin.promotion.table.stt', 'STT')}</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.table.code', 'Mã KM')}</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.table.name', 'Tên chương trình')}</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.table.type', 'Loại')}</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.promotion.table.discount', 'Số tiền giảm')}</th>
              {variant !== 'flash_sale' && (
                <>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.promotion.table.maxDiscount', 'Giảm tối đa')}</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.table.condition', 'Điều kiện')}</th>
                  <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">{t('admin.promotion.table.usage', 'Lượt dùng')}</th>
                </>
              )}
              {variant === 'flash_sale' && (
                <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.form.target')}</th>
              )}
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.table.duration', 'Hiệu lực')}</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.promotion.table.status', 'Trạng thái')}</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.promotion.table.actions', 'Thao tác')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={variant === 'flash_sale' ? 9 : 11} className="p-16 text-center text-slate-500">
                  <TicketPercent className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-700">{t('admin.promotion.table.empty', 'Chưa có khuyến mãi nào')}</p>
                  <p className="text-sm mt-1">{t('admin.promotion.table.emptyDesc', 'Nhấn "Tạo mã mới" để thêm chương trình đầu tiên')}</p>
                </td>
              </tr>
            ) : (
              data.map((promo, index) => {
                const badge = getTypeBadge(promo.type)
                return (
                  <tr key={promo.id} className="hover:bg-slate-100 transition-colors text-slate-700">
                    <td className="p-4 text-center font-medium text-slate-500">
                      {startIndex + index + 1}
                    </td>
                    <td className="p-4 font-mono font-bold text-primary text-sm tracking-wider">
                      {promo.code || t('admin.promotion.table.autoPromo', 'TỤ ĐỘNG')}
                    </td>
                    <td className="p-4 text-sm text-slate-800 font-semibold">{promo.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase rounded-md whitespace-nowrap ${badge.cls}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800 text-right">
                      {formatValue(promo.value, promo.type)}
                    </td>
                    {variant !== 'flash_sale' && (
                      <>
                        <td className="p-4 text-sm font-bold text-emerald-600 text-right">
                          {promo.maxDiscountValue && promo.maxDiscountValue > 0
                            ? `${fmt(promo.maxDiscountValue)}đ`
                            : '—'}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {promo.minOrderAmount > 0
                            ? t('admin.promotion.table.minOrderValue', 'Đơn từ {{value}}k', { value: fmt(promo.minOrderAmount / 1000) })
                            : t('admin.promotion.table.noLimit', 'Mọi đơn hàng')}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-slate-700">{promo.usedCount}</span>
                            {promo.usageLimit && (
                              <span className="text-[10px] text-slate-400 font-medium">{t('admin.promotion.table.usageLimit', { count: promo.usageLimit })}</span>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    {variant === 'flash_sale' && (
                      <td className="p-4 text-sm font-semibold text-slate-600">
                        {promo.conditions?.targetType === 'ALL' && <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs">{t('admin.promotion.form.targetAll')}</span>}
                        {promo.conditions?.targetType === 'CATEGORY' && <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs">{t('admin.promotion.form.targetCategory')}</span>}
                        {promo.conditions?.targetType === 'ITEMS' && <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md text-xs">{t('admin.promotion.form.targetItems')}</span>}
                        {!promo.conditions?.targetType && '—'}
                      </td>
                    )}
                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {`${formatDate(promo.startAt)} – ${formatDate(promo.endAt)}`}
                    </td>
                    <td className="p-4">
                      {(() => {
                        const isItemActive = promo.isActive ?? promo.active ?? false;
                        return (
                          <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md whitespace-nowrap border
                          ${isItemActive
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {isItemActive ? t('admin.promotion.table.statusActive', 'Đang chạy') : t('admin.promotion.table.statusPaused', 'Tạm dừng')}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {promo.type !== 'FLASH_SALE' && (
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => onEdit(promo)}
                            className="!text-slate-400 hover:!text-primary hover:!bg-slate-100 !p-2 !rounded-lg"
                            title={t('admin.promotion.table.edit', 'Chỉnh sửa')}
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                        )}

                        {(() => {
                          const isItemActive = promo.isActive ?? promo.active ?? false;
                          if (isItemActive) {
                            return (
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => onDelete(promo.id, promo.name)}
                                className="!text-slate-400 hover:!text-amber-500 hover:!bg-amber-100 !p-2 !rounded-lg"
                                title={promo.type === 'FLASH_SALE' ? t('admin.promotion.table.endCampaign') : t('admin.promotion.table.pause')}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            )
                          } else {
                            return (
                              <>
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => onRestore(promo.id)}
                                  className="!text-emerald-500 hover:!text-emerald-600 hover:!bg-emerald-50 !p-2 !rounded-lg"
                                  title={t('admin.promotion.table.restore', 'Khôi phục')}
                                >
                                  <RotateCcw className="w-5 h-5" />
                                </Button>
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => onHardDelete(promo.id, promo.name)}
                                  className="!text-red-400 hover:!text-red-600 hover:!bg-red-50 !p-2 !rounded-lg"
                                  title={t('admin.promotion.table.hardDelete', 'Xóa vĩnh viễn')}
                                >
                                  <ShieldBan className="w-5 h-5" />
                                </Button>
                              </>
                            )
                          }
                        })()}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
