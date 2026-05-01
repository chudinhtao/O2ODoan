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
}

export function useOrderSubmitActions({ tableId, sessionToken, cart }: UseOrderSubmitProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const prepareSession = async (): Promise<string | null> => {
    if (sessionToken) return sessionToken;
    try {
      if (tableId && tableId !== 'takeaway') {
        const res = await http.post<IApiResponse<{ sessionToken: string }>>(API_ROUTES.posSession.openManual(tableId));
        return res.data.data.sessionToken;
      } else {
        const res = await http.post<IApiResponse<{ sessionToken: string }>>('/sessions/open/takeaway');
        return res.data.data.sessionToken;
      }
    } catch (err) {
      toast.error(t('pos.order.openSessionError', 'Lỗi khi mở phiên làm việc.'));
      return null;
    }
  }



  const handleSubmit = async () => {
    if (cart.items.length === 0) return
    setIsSubmitting(true)
    try {
      const token = await prepareSession();
      if (token) {
        await posOrderService.submitTicket(token);
        toast.success(t('pos.cart.submitSuccess', 'Đã ghi nhận Order thành công!'));
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all });
        if (!tableId || tableId === 'takeaway') {
           navigate('/pos/payment/takeaway', { state: { sessionToken: token } });
        } else {
           navigate(`/pos/orders/${tableId}`, { state: { sessionToken: token } });
        }
      } else {
        toast.error(t('pos.order.sessionRequired', 'Không thể khởi tạo phiên làm việc.'));
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }, message: string }
      toast.error(t('pos.order.submitError', 'Lỗi: ') + (errorResponse?.response?.data?.message || errorResponse.message));
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckout = async () => {
    setIsSubmitting(true)
    try {
      const token = await prepareSession();
      if (token) {

         // Gửi bếp các món chưa được gửi (cho cả Takeaway và Dine-in nếu quên bấm gửi bếp)
         // Chỉ gửi nếu thực sự có món (dựa trên cart.items.length > 0)
         if (cart.items.length > 0) {
            try {
              await posOrderService.submitTicket(token);
              // Invalidate cache để PaymentPage nhận được ticket vừa tạo
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all });
            } catch (err: any) {
              // Bỏ qua lỗi nếu backend báo giỏ hàng trống
              console.warn('Giỏ hàng trống khi gọi submitTicket', err);
            }
         }
         
         if (!tableId || tableId === 'takeaway') {
            navigate('/pos/payment/takeaway', { state: { sessionToken: token } })
         } else {
            navigate(`/pos/payment/${tableId}`, { state: { sessionToken: token } });
         }
      } else {
         toast.error(t('pos.order.sessionRequired', 'Không thể khởi tạo phiên làm việc.'));
      }
    } catch (err: unknown) {
      toast.error(t('pos.order.checkoutProcessError', 'Lỗi khi xử lý thanh toán'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, handleSubmit, handleCheckout, prepareSession }
}
