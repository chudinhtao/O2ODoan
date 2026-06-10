import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/ROUTES'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { usePosCheckout, usePosApplyPromotion } from '@/pages/pos/order-detail/hooks/usePosOrder'
import { AggregatedItem } from '../components/InvoicePanel'
import { orderService } from '@/pages/admin/orders/services/order.service'

export function usePaymentLogic(
  tableId: string | undefined,
  sessionToken: string | null,
  serverOrder: IOrder | null | undefined,
  releaseTable: boolean
) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: checkout, isPending: isCheckingOut } = usePosCheckout()
  const [cashGivenStr, setCashGivenStr] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const { mutate: applyPromoServer, isPending: isApplyingPromoServer } = usePosApplyPromotion()

  // QR thuần (PayOS full amount) state
  const [qrPayosUrl, setQrPayosUrl] = useState<string | null>(null)
  const [qrPayosCode, setQrPayosCode] = useState<string | null>(null)
  const [isCreatingQrPayos, setIsCreatingQrPayos] = useState(false)

  // Mixed Payment state
  const [mixedQrUrl, setMixedQrUrl] = useState<string | null>(null)
  const [mixedQrCode, setMixedQrCode] = useState<string | null>(null)
  const [isCreatingQr, setIsCreatingQr] = useState(false)

  const order = useMemo<IOrder | null>(() => {
    if (serverOrder) return serverOrder as IOrder
    return null
  }, [serverOrder])

  // Lắng nghe sự kiện thanh toán thành công từ Webhook (real-time)
  useEffect(() => {
    if (order?.status === 'PAID') {
      toast.success(t('pos.payment.autoPaid', 'Đơn hàng đã được thanh toán thành công (Webhook)!'), {
        duration: 5000,
      })
      navigate(tableId === 'takeaway' ? '/pos/takeaways' : ROUTES.pos.tables)
    }
  }, [order?.status, navigate, tableId, t])

  const aggregatedItems = useMemo<AggregatedItem[]>(() => {
    if (!order) return []
    const map = new Map<string, AggregatedItem>()

    order.tickets.forEach((ticket) => {
      if (ticket.status === 'CANCELLED') return
      ticket.items.forEach((item) => {
        if (item.status === 'CANCELLED' || item.status === 'RETURNED') return
        const extra = item.options?.reduce((acc, o) => acc + (o.extraPrice || 0), 0) || 0
        const price = (item.unitPrice || 0) + extra
        const key = `${item.itemName}-${item.options?.map((o) => o.id).join('-')}`
        const existing = map.get(key)

        if (existing) {
          existing.qty += item.quantity || 0
          existing.total += price * (item.quantity || 0)
        } else {
          map.set(key, {
            name:
              item.itemName +
              (item.options?.length > 0
                ? ` (${item.options.map((o) => o.optionName).join(', ')})`
                : ''),
            qty: item.quantity || 0,
            unitPrice: price,
            total: price * (item.quantity || 0),
          })
        }
      })
    })
    return Array.from(map.values())
  }, [order])

  const handleCashGivenChange = (val: string) => {
    const numStr = val.replace(/[^0-9]/g, '')
    setCashGivenStr(numStr)
    // Reset QR MIXED nếu thu ngân đổi số tiền mặt
    if (mixedQrUrl) setMixedQrUrl(null)
  }

  const handleApplyVoucher = async (code: string) => {
    if (!order?.id) return
    applyPromoServer({ orderId: order.id, code }, { onSuccess: () => setVoucherCode('') })
  }

  const orderTotal = Math.max(0, order?.total || 0)
  const actualTotalBeforeDeposit = Math.max(0, (order?.subtotal || 0) - (order?.discount || 0))
  const excessDeposit = order?.depositAmount ? Math.max(0, order.depositAmount - actualTotalBeforeDeposit) : 0

  const cashGiven = cashGivenStr ? parseInt(cashGivenStr, 10) : 0

  // Số tiền còn thiếu cần quét QR (chỉ dùng trong luồng MIXED)
  const qrAmount = Math.max(0, orderTotal - cashGiven)
  // Điều kiện để kích hoạt Mixed: Khách có đưa tiền mặt nhưng chưa đủ
  const isMixedReady = cashGiven > 0 && cashGiven < orderTotal

  /**
   * CASE: QR (PayOS full amount)
   * Tạo PayOS link cho toàn bộ bill → hiển thị QR → Webhook tự đóng order.
   * Thu ngân KHÔNG cần bấm gì thêm. Nút "Đã nhận" chỉ là fallback thủ công.
   */
  const handleQrCreateLink = async () => {
    if (!order?.id || !sessionToken) return
    setIsCreatingQrPayos(true)
    try {
      const data = await orderService.createPayosLink(order.id, sessionToken, orderTotal)
      setQrPayosUrl(data.checkoutUrl)
      if (data.qrCode) setQrPayosCode(data.qrCode)
      toast.success(t('pos.payment.qrCreated', 'Đã tạo mã QR – Hướng dẫn khách quét'))
    } catch (err: any) {
      // Error is handled by interceptor
    } finally {
      setIsCreatingQrPayos(false)
    }
  }

  /**
   * CASE: MIXED (Tiền mặt + QR PayOS phần còn thiếu)
   * Bước 1: Thu ngân nhập tiền mặt → tính qrAmount.
   * Bước 2: Gọi API tạo PayOS link với cashAmount → Backend lưu MIXED + paymentDetail.
   * Bước 3: Webhook PayOS xác nhận → auto closeOrder.
   */
  const handleMixedCreateQr = async () => {
    if (!order?.id || !sessionToken) return
    setIsCreatingQr(true)
    try {
      const data = await orderService.createPayosLink(order.id, sessionToken, qrAmount, cashGiven)
      setMixedQrUrl(data.checkoutUrl)
      if (data.qrCode) setMixedQrCode(data.qrCode)
      toast.success(t('pos.payment.mixedQrCreated', 'Đã tạo mã QR – Hướng dẫn khách quét'))
    } catch (err: any) {
      // Error is handled by interceptor
    } finally {
      setIsCreatingQr(false)
    }
  }

  /** Hàm chính xử lý checkout, nhận paymentMethod từ UI */
  const handlePaymentSubmit = (paymentMethod: string) => {
    if (!order) return

    if (!sessionToken) return

    // --- CASE: QR (PayOS) ---
    // Webhook PayOS sẽ tự đóng order. Nút confirm này là FALLBACK thủ công
    // phòng trường hợp webhook chậm hoặc mạng delay.
    if (paymentMethod === 'QR') {
      if (!qrPayosUrl) {
        toast.error(t('pos.payment.qrNoLink', 'Vui lòng tạo mã QR trước!'))
        return
      }
      // Manual fallback checkout — Backend sẽ validate nếu PayOS đã ghi PAID chưa
      checkout(
        { orderId: order.id, releaseTable, paymentMethod: 'PayOS', paymentDetail: null },
        {
          onSuccess: () => {
            toast.success(t('pos.payment.successCleaning', 'Thanh toán thành công! Bàn đang được dọn dẹp.'))
            navigate(tableId === 'takeaway' ? '/pos/takeaways' : ROUTES.pos.tables)
          }
        }
      )
      return
    }

    // --- CASE: MIXED ---
    // Webhook PayOS tự đóng sau khi khách quét phần còn thiếu.
    // Nút confirm là FALLBACK nếu webhook delay — Backend validate tổng CASH + QR.
    if (paymentMethod === 'MIXED') {
      if (!mixedQrUrl) {
        toast.error(t('pos.payment.mixedNoQr', 'Vui lòng tạo mã QR trước khi xác nhận!'))
        return
      }
      checkout(
        {
          orderId: order.id,
          releaseTable,
          paymentMethod: 'MIXED',
          paymentDetail: { CASH: cashGiven, QR: qrAmount },
        },
        {
          onSuccess: () => {
            toast.success(t('pos.payment.mixedSuccess', 'Thanh toán Mixed thành công!'))
            navigate(tableId === 'takeaway' ? '/pos/takeaways' : ROUTES.pos.tables)
          }
        }
      )
      return
    }

    // --- CASE: CASH (Tiền mặt toàn bộ) ---
    // Thu ngân xác nhận đã nhận đủ tiền mặt → checkout ngay lập tức.
    checkout(
      {
        orderId: order.id,
        releaseTable,
        paymentMethod: 'CASH',
        paymentDetail: cashGiven > 0 ? { CASH: cashGiven } : null,
      },
      {
        onSuccess: () => {
          const msg = releaseTable
            ? t('pos.payment.successCleaning', 'Thanh toán thành công! Bàn đang được dọn dẹp.')
            : t('pos.payment.successServing', 'Thanh toán thành công! (Bàn vẫn tiếp tục phục vụ)')
          toast.success(msg)
          navigate(tableId === 'takeaway' ? '/pos/takeaways' : ROUTES.pos.tables)
        }
      }
    )
  }

  return {
    order,
    aggregatedItems,
    orderTotal,
    cashGiven,
    cashGivenStr,
    setCashGivenStr,
    handleCashGivenChange,
    handlePaymentSubmit,
    handleApplyVoucher,
    isCheckingOut,
    voucherCode,
    setVoucherCode,
    isApplyingVoucher: isApplyingPromoServer,
    // QR PayOS (full amount)
    qrPayosUrl,
    qrPayosCode,
    isCreatingQrPayos,
    handleQrCreateLink,
    // Mixed Payment
    mixedQrUrl,
    mixedQrCode,
    isCreatingQr,
    qrAmount,
    isMixedReady,
    handleMixedCreateQr,
    excessDeposit,
  }
}

