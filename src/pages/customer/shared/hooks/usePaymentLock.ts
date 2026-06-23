import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCustomerSessionOrder } from '../../menu/hooks/useCustomerQueries'
import { ROUTES } from '@/shared/constants/ROUTES'

export function usePaymentLock(token: string | null) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: sessionOrder } = useCustomerSessionOrder(token)

  useEffect(() => {
    if (!token || !sessionOrder) return
    
    // Nếu đơn hàng đang yêu cầu thanh toán (chuyển khoản)
    // Và người dùng ĐANG KHÔNG Ở TRANG PAYMENT
    // Thì bắt buộc đẩy về trang Payment
    if (sessionOrder.status === 'PAYMENT_REQUESTED' && !location.pathname.includes(ROUTES.customer.payment)) {
      navigate(`${ROUTES.customer.payment}?t=${token}`, { replace: true })
    }
  }, [sessionOrder, navigate, token, location.pathname])
}
