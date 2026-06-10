import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import { getSuccessMessage, unwrapApiData } from '@/shared/utils/apiResponse'
import type { ICart } from '../types/posOrder.type'
import { posOrderService } from '../services/posOrder.service'

interface UseOrderSubmitProps {
  tableId?: string
  sessionToken: string
  cart: ICart
}

export function useOrderSubmitActions({ tableId, sessionToken, cart }: UseOrderSubmitProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const prepareSession = async (): Promise<string | null> => {
    if (sessionToken) return sessionToken
    try {
      if (tableId && tableId !== 'takeaway') {
        const data = await http.post<IApiResponse<{ sessionToken: string }>>(API_ROUTES.posSession.openManual(tableId)).then(unwrapApiData)
        return data.sessionToken
      }

      const data = await http.post<IApiResponse<{ sessionToken: string }>>('/sessions/open/takeaway').then(unwrapApiData)
      return data.sessionToken
    } catch (error) {
      // Error is handled by interceptor
      return null
    }
  }

  const handleSubmit = async () => {
    if (cart.items.length === 0) return
    setIsSubmitting(true)
    try {
      const token = await prepareSession()
      if (token) {
        const res = await posOrderService.submitTicket(token)
        toast.success(getSuccessMessage(res.message, t('pos.cart.submitSuccess', 'Đã ghi nhận order thành công!')))
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
        if (!tableId || tableId === 'takeaway') {
          navigate('/pos/payment/takeaway', { state: { sessionToken: token } })
        } else {
          navigate(`/pos/orders/${tableId}`, { state: { sessionToken: token } })
        }
      } else {
        toast.error(t('pos.order.sessionRequired', 'Không thể khởi tạo phiên làm việc.'))
      }
    } catch {
      // API error toast is handled by the interceptor.
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckout = async () => {
    setIsSubmitting(true)
    try {
      const token = await prepareSession()
      if (token) {
        if (cart.items.length > 0) {
          try {
            await posOrderService.submitTicket(token)
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
          } catch {
            // Empty-cart submit is non-blocking for checkout navigation.
          }
        }

        if (!tableId || tableId === 'takeaway') {
          navigate('/pos/payment/takeaway', { state: { sessionToken: token } })
        } else {
          navigate(`/pos/payment/${tableId}`, { state: { sessionToken: token } })
        }
      } else {
        toast.error(t('pos.order.sessionRequired', 'Không thể khởi tạo phiên làm việc.'))
      }
    } catch (error) {
      // Error is handled by interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, handleSubmit, handleCheckout, prepareSession }
}
