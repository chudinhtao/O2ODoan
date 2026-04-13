import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import { ICart } from '../types/posOrder.type'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { posOrderService } from '../services/posOrder.service'

interface UseOrderSubmitProps {
  tableId?: string;
  sessionToken: string;
  cart: ICart;
  localCart: ICart;
  setLocalCart: (cart: ICart) => void;
}

export function useOrderSubmitActions({ tableId, sessionToken, cart, localCart, setLocalCart }: UseOrderSubmitProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const prepareSession = async (): Promise<string | null> => {
    if (sessionToken) return sessionToken;
    if (tableId && tableId !== 'takeaway') {
      try {
        const res = await http.post<IApiResponse<{ sessionToken: string }>>(API_ROUTES.posSession.openManual(tableId));
        return res.data.data.sessionToken;
      } catch (err) {
        toast.error(t('pos.order.openSessionError', 'Lỗi khi mở phiên làm việc.'));
        return null;
      }
    }
    return null;
  }

  const syncLocalCartToSession = async (token: string) => {
    if (localCart.items.length === 0) return;
    const addPromises = localCart.items.map(item => 
       posOrderService.addCartItem(token, {
         menuItemId: item.menuItemId,
         quantity: item.quantity,
         note: item.note,
         options: item.options.map(o => ({ optionId: o.optionId as string }))
       })
    );
    await Promise.all(addPromises);
  }

  const handleSubmit = async () => {
    if (cart.items.length === 0) return
    setIsSubmitting(true)
    try {
      const token = await prepareSession();
      if (token) {
        await syncLocalCartToSession(token);
        await posOrderService.submitTicket(token);
        toast.success(t('pos.cart.submitSuccess', 'Đã ghi nhận Order thành công!'));
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all });
        navigate(`/pos/orders/${tableId}`, { state: { sessionToken: token } });
      } else {
        navigate('/pos/payment/takeaway', { state: { cart: localCart } });
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }, message: string }
      toast.error(t('pos.order.submitError', 'Lỗi: ') + (errorResponse?.response?.data?.message || errorResponse.message));
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckout = async () => {
    if (cart.items.length === 0) return
    setIsSubmitting(true)
    try {
      if (!tableId || tableId === 'takeaway') {
         navigate('/pos/payment/takeaway', { state: { cart: localCart } })
      } else {
         const token = await prepareSession();
         if (token) {
           await syncLocalCartToSession(token);
           if (localCart.items.length > 0) {
             await posOrderService.submitTicket(token);
             setLocalCart({ items: [], totalAmount: 0, sessionToken: '' } as unknown as ICart);
           }
         }
         navigate(`/pos/payment/${tableId}`);
      }
    } catch (err: unknown) {
      toast.error(t('pos.order.checkoutProcessError', 'Lỗi khi xử lý thanh toán'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, handleSubmit, handleCheckout, prepareSession }
}
