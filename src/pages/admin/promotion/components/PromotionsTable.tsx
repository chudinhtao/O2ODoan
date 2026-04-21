import { format } from 'date-fns'
import { TicketPercent, Edit, Trash2, Percent, Banknote, Zap, Ticket, ShoppingCart, Tag, Package, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { SkeletonTable } from '@/shared/components/ui/Skeleton'
import type { IPromotion, PromotionDiscountType, PromotionScope, PromotionTriggerType } from '../types/adminPromotion.type'

interface PromotionsTableProps {
  data: IPromotion[]
  isLoading: boolean
  startIndex?: number
  onEdit: (promotion: IPromotion) => void
  onDelete: (id: string, name: string) => void
  onToggle: (id: string) => void
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—'
  try { return format(new Date(dateString), 'HH:mm dd/MM/yy') }
  catch { return dateString }
}

const formatDiscountValue = (value: number | null, type: PromotionDiscountType) => {
  if (value == null) return '—'
  if (type === 'PERCENT') return `${value}%`
  return `${fmt(value)}đ`
}

const scopeBadge: Record<PromotionScope, { label: string; cls: string; icon: typeof Tag }> = {
  ORDER:   { label: 'Đơn hàng', cls: 'bg-blue-50 text-blue-600 border-blue-100',    icon: ShoppingCart },
  PRODUCT: { label: 'Sản phẩm', cls: 'bg-green-50 text-green-600 border-green-100', icon: Tag },
  BUNDLE:  { label: 'Combo',    cls: 'bg-amber-50 text-amber-600 border-amber-100', icon: Package },
}

const discountBadge: Record<PromotionDiscountType, { label: string; cls: string; icon: typeof Percent }> = {
  PERCENT:    { label: '%',        cls: 'bg-primary/10 text-primary border-primary/20',             icon: Percent },
  FIX_AMOUNT: { label: 'Cố định', cls: 'bg-secondary/10 text-secondary border-secondary/20',       icon: Banknote },
  FIX_PRICE:  { label: 'Giá cố',  cls: 'bg-rose-50 text-rose-600 border-rose-100',                 icon: Banknote },
}

const triggerBadge: Record<PromotionTriggerType, { label: string; cls: string; icon: typeof Zap }> = {
  AUTO:   { label: 'Tự động', cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: Zap },
  COUPON: { label: 'Coupon',  cls: 'bg-teal-50 text-teal-600 border-teal-100',     icon: Ticket },
}

const statusBadge: Record<IPromotion['displayStatus'], { label: string; cls: string }> = {
  ACTIVE:    { label: '● Đang chạy',  cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  SCHEDULED: { label: '◔ Sắp tới',   cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  EXPIRED:   { label: '○ Hết hạn',   cls: 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm opacity-80' },
  DISABLED:  { label: '◌ Tạm dừng',  cls: 'bg-slate-50 text-slate-500 border-slate-200' },
}

export function PromotionsTable({
  data, isLoading, startIndex = 0, onEdit, onDelete, onToggle
}: PromotionsTableProps) {

  if (isLoading) return <SkeletonTable rows={5} cols={9} />

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-14 text-center">#</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mã / Tên</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phạm vi</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kích hoạt</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loại giảm</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Giá trị</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Lượt dùng</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hiệu lực</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
              <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-16 text-center text-slate-400">
                  <TicketPercent className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-semibold text-slate-600">Chưa có chương trình khuyến mãi nào</p>
                  <p className="text-sm mt-1">Nhấn "Tạo mới" để thêm chương trình đầu tiên</p>
                </td>
              </tr>
            ) : (
              data.map((promo, index) => {
                const scope = scopeBadge[promo.scope] ?? scopeBadge.ORDER
                const discount = discountBadge[promo.discountType] ?? discountBadge.PERCENT
                const trigger = triggerBadge[promo.triggerType] ?? triggerBadge.AUTO
                const ScopeIcon = scope.icon
                const DiscountIcon = discount.icon
                const TriggerIcon = trigger.icon
                const isActive = promo.active

                return (
                  <tr key={promo.id} className="hover:bg-slate-50/70 transition-colors text-slate-700">
                    <td className="p-4 text-center font-medium text-slate-400 text-sm">{startIndex + index + 1}</td>

                    <td className="p-4">
                      <div className="font-mono font-bold text-primary text-sm tracking-wider">
                        {promo.code ?? <span className="text-slate-400 font-normal text-xs not-italic">Không có mã</span>}
                      </div>
                      <div className="text-sm text-slate-700 font-semibold mt-0.5">{promo.name}</div>
                      {promo.stackable && (
                        <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">⚡ Stackable</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${scope.cls}`}>
                        <ScopeIcon className="w-3 h-3" />
                        {scope.label}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${trigger.cls}`}>
                        <TriggerIcon className="w-3 h-3" />
                        {trigger.label}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${discount.cls}`}>
                        <DiscountIcon className="w-3 h-3" />
                        {discount.label}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-slate-800">
                        {formatDiscountValue(promo.discountValue, promo.discountType)}
                      </span>
                      {promo.maxDiscount && promo.discountType === 'PERCENT' && (
                        <div className="text-[10px] text-slate-400">tối đa {fmt(promo.maxDiscount)}đ</div>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className="text-sm font-bold text-slate-700">{promo.usedCount}</span>
                      {promo.usageLimit && (
                        <div className="text-[10px] text-slate-400">/ {promo.usageLimit}</div>
                      )}
                    </td>

                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      <div>{formatDate(promo.startAt)}</div>
                      <div className="text-slate-300">→ {formatDate(promo.endAt)}</div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md border min-w-[90px] ${statusBadge[promo.displayStatus].cls}`}>
                        {statusBadge[promo.displayStatus].label}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => onEdit(promo)}
                          className="!text-slate-400 hover:!text-primary hover:!bg-primary/10 !p-2 !rounded-lg"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => onToggle(promo.id)}
                          className={`!p-2 !rounded-lg ${isActive ? '!text-amber-500 hover:!bg-amber-50' : '!text-emerald-500 hover:!bg-emerald-50'}`}
                          title={isActive ? 'Tạm dừng' : 'Kích hoạt lại'}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => onDelete(promo.id, promo.name)}
                          className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50 !p-2 !rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
