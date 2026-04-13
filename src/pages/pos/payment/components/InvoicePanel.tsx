import { useTranslation } from 'react-i18next'
import { Tag, Edit, Check, ReceiptText, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { Input } from '@/shared/components/ui/Input'

export interface AggregatedItem {
  cartItemId?: string
  menuItemId?: string
  name: string
  qty: number
  unitPrice: number
  total: number
}

interface InvoicePanelProps {
  order: IOrder
  aggregatedItems: AggregatedItem[]
  tableId?: string
  onEditOrder: () => void
  onApplyVoucher?: (code: string) => void
  voucherCode?: string
  setVoucherCode?: (val: string) => void
  isApplyingVoucher?: boolean
}

export function InvoicePanel({ 
  order, 
  aggregatedItems, 
  onEditOrder, 
  onApplyVoucher,
  voucherCode = '',
  setVoucherCode,
  isApplyingVoucher = false
}: InvoicePanelProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-surface rounded-3xl shadow-xl shadow-black/5 border border-outline-variant/50 overflow-hidden flex flex-col h-full min-h-0">
      <div className="px-6 py-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ReceiptText className="size-4.5" />
          </div>
          <h3 className="font-black text-on-surface uppercase tracking-tight text-base">
            {t('pos.payment.invoiceDetail', 'Chi tiết hóa đơn')}
          </h3>
        </div>
        <Button 
          variant="ghost"
          size="sm"
          onClick={onEditOrder} 
          className="text-primary hover:bg-primary/5 text-xs font-black flex items-center gap-2 rounded-xl h-9 px-4 transition-all"
        >
          <Edit className="size-3.5" />
          {t('pos.payment.editOrder', 'Chỉnh sửa')}
        </Button>
      </div>

      {/* Compact Item List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-hide">
        {aggregatedItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group py-1.5 transition-all">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-primary leading-none">{item.qty}×</span>
                <span className="text-sm font-bold text-on-surface truncate pr-4">{item.name}</span>
              </div>
              <span className="text-[10px] font-black text-outline uppercase tracking-[0.1em] mt-1 opacity-70">
                {item.unitPrice.toLocaleString('vi-VN')} {t('common.units.currency', 'đ')} / {t('pos.payment.perItem', 'món')}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-on-surface tabular-nums">
                {item.total.toLocaleString('vi-VN')}{t('common.units.currency', 'đ')}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Voucher & Summary Section - Unified */}
      <div className="p-6 bg-surface-container-low/50 border-t border-outline-variant/40 space-y-6">
        
        {/* Voucher Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-outline">
            <Tag className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mt-0.5">
              {t('pos.payment.voucherLabel', 'Mã ưu đãi')}
            </span>
          </div>

          {order.promotionId ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-emerald-500/10 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Check className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase leading-none mb-1">{t('pos.payment.appliedVoucher', 'Đã áp dụng')}</p>
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight">{order.promotionCode || 'VOUCHER'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-sm font-black text-emerald-600">-{order.discount?.toLocaleString('vi-VN')}{t('common.units.currency', 'đ')}</span>
                <button 
                  onClick={() => onApplyVoucher?.('')}
                  disabled={isApplyingVoucher}
                  className="size-8 flex items-center justify-center text-outline hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Input
                  placeholder={t('pos.payment.voucherPlaceholder', 'Nhập mã giảm giá...')}
                  value={voucherCode}
                  onChange={e => setVoucherCode?.(e.target.value.toUpperCase())}
                  className="h-11 pl-4 text-xs font-bold bg-surface border-outline-variant focus:border-primary rounded-xl transition-all"
                />
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                className="h-11 px-6 font-black text-[11px] uppercase rounded-xl shadow-lg shadow-primary/20"
                onClick={() => onApplyVoucher?.(voucherCode)}
                disabled={!voucherCode.trim() || isApplyingVoucher}
                isLoading={isApplyingVoucher}
              >
                {t('common.apply', 'Dùng mã')}
              </Button>
            </div>
          )}
        </div>

        {/* Totals Summary */}
        <div className="space-y-3 pt-6 border-t border-outline-variant/30">
          <div className="flex justify-between items-center text-[10px] font-black text-outline uppercase tracking-[0.15em] opacity-60">
            <span>{t('pos.payment.subtotal', 'Tạm tính')}</span>
            <span className="tabular-nums">{order.subtotal.toLocaleString('vi-VN')}{t('common.units.currency', 'đ')}</span>
          </div>
          
          {(order.discount || 0) > 0 && (
            <div className="flex justify-between items-center text-[10px] text-emerald-600 font-black uppercase tracking-[0.15em]">
              <span className="flex items-center gap-1.5">
                {t('pos.payment.discount', 'Chiết khấu')}
              </span>
              <span className="tabular-nums">-{(order.discount || 0).toLocaleString('vi-VN')}{t('common.units.currency', 'đ')}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] font-black text-outline uppercase tracking-[0.15em] opacity-60">
            <span>{t('pos.payment.tax', 'VAT (0%)')}</span>
            <span className="tabular-nums">0{t('common.units.currency', 'đ')}</span>
          </div>

          <div className="flex justify-between items-center pt-4 mt-1 border-t border-outline-variant/10">
            <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em] opacity-80">
              {t('pos.payment.grandTotal', 'Tổng thanh toán')}
            </span>
            <span className="text-4xl font-black text-primary font-headline tracking-tighter leading-none">
              {order.total.toLocaleString('vi-VN')}{t('common.units.currency', 'đ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
