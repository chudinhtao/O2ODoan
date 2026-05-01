import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'
import http from '@/services/interceptor'
import { ROUTES } from '@/shared/constants/ROUTES'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IOrder, IOrderTicket, IOrderTicketItem } from '@/pages/admin/orders/types/order.type'
import { ICartItem } from '@/pages/pos/order-entry/types/posOrder.type'
import { usePosCheckout, usePosApplyPromotion } from '@/pages/pos/order-detail/hooks/usePosOrder'
import { AggregatedItem } from '../components/InvoicePanel'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { orderService } from '@/pages/admin/orders/services/order.service'

export function usePaymentLogic(
  tableId: string | undefined,
  sessionToken: string | null,
  serverOrder: IOrder | null | undefined,
  releaseTable: boolean
) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { mutate: checkout, isPending: isCheckingOut } = usePosCheckout()
  const [cashGivenStr, setCashGivenStr] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [takeawayPromo, setTakeawayPromo] = useState<{ code: string; discount: number } | null>(null)
  const { mutate: applyPromoServer, isPending: isApplyingPromoServer } = usePosApplyPromotion()

  // QR thuần (PayOS full amount) state
  const [qrPayosUrl, setQrPayosUrl] = useState<string | null>(null)
  const [isCreatingQrPayos, setIsCreatingQrPayos] = useState(false)

  // Mixed Payment state
  const [mixedQrUrl, setMixedQrUrl] = useState<string | null>(null)
  const [isCreatingQr, setIsCreatingQr] = useState(false)

  const order = useMemo<IOrder | null>(() => {
    if (serverOrder) return serverOrder as IOrder

    if (tableId === 'takeaway') {
      const cart = location.state?.cart
      if (!cart) return null

      const sub = cart.totalAmount || 0
      const disc = takeawayPromo?.discount || 0

      return {
        id: 'TAKEAWAY-TEMP',
        tableNumber: t('pos.payment.takeawayTable', 'Mang về'),
        subtotal: sub,
        discount: disc,
        total: Math.max(0, sub - disc),
        promotionCode: takeawayPromo?.code,
        tickets: [
          {
            id: 'T1',
            status: 'COMPLETED',
            items: cart.items.map(
              (it: ICartItem) =>
                ({
                  id: it.cartItemId,
                  menuItemId: it.menuItemId,
                  itemName: it.name || t('pos.payment.unknownItem', 'Món'),
                  quantity: it.quantity,
                  unitPrice: it.basePrice || 0,
                  options: (it.options || []).map((o) => ({
                    id: o.optionId,
                    optionName: o.optionName,
                    extraPrice: o.extraPrice,
                  })),
                  note: it.note,
                  status: 'PENDING',
                  station: 'KITCHEN',
                  createdAt: new Date().toISOString(),
                }) as unknown as IOrderTicketItem
            ),
          } as unknown as IOrderTicket,
        ],
      } as unknown as IOrder
    }
    return null
  }, [tableId, location.state?.cart, serverOrder, t, takeawayPromo])

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
    if (tableId === 'takeaway') {
      if (!code.trim()) {
        setTakeawayPromo(null)
        setVoucherCode('')
        return
      }
      try {
        const subtotal = order?.subtotal || 0
        const res = await http.get<IApiResponse<{ discount: number; type: string; value: number }>>(
          API_ROUTES.promotion.validate,
          { params: { code, amount: subtotal } }
        )
        if (res.data.success) {
          setTakeawayPromo({ code: code.toUpperCase(), discount: res.data.data.discount })
          setVoucherCode('')
          toast.success(t('pos.payment.appliedPromo', 'Đã áp dụng mã giảm giá'))
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || t('pos.payment.invalidVoucher', 'Mã không khả dụng')
        toast.error(msg)
      }
      return
    }

    if (!order?.id) return
    applyPromoServer({ orderId: order.id, code }, { onSuccess: () => setVoucherCode('') })
  }

  const orderTotal = Math.max(0, order?.total || 0)
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
      const url = await orderService.createPayosLink(order.id, sessionToken, orderTotal)
      setQrPayosUrl(url)
      toast.success(t('pos.payment.qrCreated', 'Đã tạo mã QR – Hướng dẫn khách quét'))
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('pos.payment.qrError', 'Không thể tạo mã QR PayOS'))
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
      const url = await orderService.createPayosLink(order.id, sessionToken, qrAmount, cashGiven)
      setMixedQrUrl(url)
      toast.success(t('pos.payment.mixedQrCreated', 'Đã tạo mã QR – Hướng dẫn khách quét'))
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('pos.payment.mixedQrError', 'Không thể tạo mã QR'))
    } finally {
      setIsCreatingQr(false)
    }
  }

  /** Hàm chính xử lý checkout, nhận paymentMethod từ UI */
  const handlePaymentSubmit = (paymentMethod: string) => {
    if (!order) return

    // --- Luồng Takeaway ---
    if (tableId === 'takeaway' && (!serverOrder || !sessionToken)) {
      const takeawayReq = {
        note: '',
        promotionCode: takeawayPromo?.code || '',
        items: order.tickets[0].items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          note: i.note,
          options: i.options.map((o) => ({ optionId: o.id })),
        })),
      }
      http
        .post('/orders/takeaway', takeawayReq)
        .then(() => {
          toast.success(t('pos.payment.takeawaySuccess', 'Thanh toán Takeaway thành công'))
          navigate('/pos/takeaways')
        })
        .catch((err) =>
          toast.error(t('pos.payment.errorPrefix', 'Lỗi: ') + (err.response?.data?.message || err.message))
        )
      return
    }

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
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string }
            toast.error(error.response?.data?.message || t('pos.payment.failure', 'Lỗi thanh toán'))
          },
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
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string }
            toast.error(error.response?.data?.message || t('pos.payment.failure', 'Lỗi thanh toán'))
          },
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
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string }
          toast.error(error.response?.data?.message || t('pos.payment.failure', 'Lỗi thanh toán'))
        },
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
    isCreatingQrPayos,
    handleQrCreateLink,
    // Mixed Payment
    mixedQrUrl,
    isCreatingQr,
    qrAmount,
    isMixedReady,
    handleMixedCreateQr,
  }
}
