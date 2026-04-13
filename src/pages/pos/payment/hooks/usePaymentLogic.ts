import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'
import http from '@/services/interceptor'
import { ROUTES } from '@/shared/constants/ROUTES'
import { IOrder, IOrderTicket, IOrderTicketItem } from '@/pages/admin/orders/types/order.type'
import { ICartItem } from '@/pages/pos/order-entry/types/posOrder.type'
import { usePosCheckout, usePosApplyPromotion } from '@/pages/pos/order-detail/hooks/usePosOrder'
import { AggregatedItem } from '../components/InvoicePanel'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'

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
  const [takeawayPromo, setTakeawayPromo] = useState<{ code: string, discount: number } | null>(null)
  const { mutate: applyPromoServer, isPending: isApplyingPromoServer } = usePosApplyPromotion()

  const order = useMemo<IOrder | null>(() => {
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
        total: sub - disc,
        promotionCode: takeawayPromo?.code,
        tickets: [{
          id: 'T1',
          status: 'COMPLETED',
          items: cart.items.map((it: ICartItem) => ({
             id: it.cartItemId,
             menuItemId: it.menuItemId,
             itemName: it.name || t('pos.payment.unknownItem', 'Món'),
             quantity: it.quantity,
             unitPrice: it.basePrice || 0,
             options: (it.options || []).map(o => ({
               id: o.optionId,
               optionName: o.optionName,
               extraPrice: o.extraPrice
             })),
             note: it.note,
             status: 'PENDING',
             station: 'KITCHEN',
             createdAt: new Date().toISOString()
          }) as unknown as IOrderTicketItem)
        } as unknown as IOrderTicket]
      } as unknown as IOrder
    }
    return serverOrder as IOrder | null
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
            name: item.itemName + (item.options?.length > 0 ? ` (${item.options.map(o => o.optionName).join(', ')})` : ''),
            qty: item.quantity || 0,
            unitPrice: price,
            total: price * (item.quantity || 0)
          })
        }
      })
    })
    return Array.from(map.values())
  }, [order])

  const handleCashGivenChange = (val: string) => {
    const numStr = val.replace(/[^0-9]/g, '')
    setCashGivenStr(numStr)
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
        const res = await http.get<IApiResponse<{ discount: number, type: string, value: number }>>(
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
    applyPromoServer({ orderId: order.id, code }, {
      onSuccess: () => setVoucherCode('')
    })
  }

  const orderTotal = order?.total || 0
  const cashGiven = cashGivenStr ? parseInt(cashGivenStr, 10) : 0

  const handlePaymentSubmit = () => {
    if (!order) return
    
    if (tableId === 'takeaway') {
      const takeawayReq = {
        note: "",
        promotionCode: takeawayPromo?.code || "",
        items: order.tickets[0].items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          note: i.note,
          options: i.options.map(o => ({ optionId: o.id }))
        }))
      }
      http.post('/orders/takeaway', takeawayReq).then(() => {
        toast.success(t('pos.payment.takeawaySuccess', "Thanh toán Takeaway thành công"))
        navigate(ROUTES.pos.tables)
      }).catch(err => toast.error(t('pos.payment.errorPrefix', "Lỗi: ") + (err.response?.data?.message || err.message)))
      return
    }

    if (!sessionToken) return
    
    checkout(
      { orderId: order.id, releaseTable },
      {
        onSuccess: () => {
          const msg = releaseTable 
            ? t('pos.payment.successCleaning', "Thanh toán thành công! Bàn đang được dọn dẹp.")
            : t('pos.payment.successServing', "Thanh toán thành công! (Bàn vẫn tiếp tục phục vụ)");
          toast.success(msg)
          navigate(ROUTES.pos.tables)
        },
        onError: (err: unknown) => {
           const error = err as { response?: { data?: { message?: string } }, message?: string }
           toast.error(error.response?.data?.message || t('pos.payment.failure', "Lỗi thanh toán"))
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
    isApplyingVoucher: isApplyingPromoServer
  }
}
