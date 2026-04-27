import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePosSessionOrder, usePosCancelOrder } from '../hooks/usePosOrder'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ROUTES } from '@/shared/constants/ROUTES'
import { Undo2, AlertCircle, ShoppingBag, CreditCard, RefreshCw, ArrowLeft, ReceiptText, Smartphone, Keyboard, Printer } from 'lucide-react'
import { usePosCancelItem, usePosReturnItem, usePosRequestPayment, usePosCancelTicket } from '../hooks/usePosOrder'
import { Input } from '@/shared/components/ui/Input'
import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'

import { TicketCard, TicketStatusBadge } from '../components/TicketCard'

export default function OrderDetailPage() {
  const { t } = useTranslation()
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelItemState, setCancelItemState] = useState<{ itemId: string, name: string, status: string, reason: string } | null>(null)
  const [returnItemState, setReturnItemState] = useState<{ itemId: string, name: string, reason: string } | null>(null)
  const [cancelTicketState, setCancelTicketState] = useState<{ ticketId: string, index: number, reason: string } | null>(null)

  const [sessionToken, setSessionToken] = useState<string>(location.state?.sessionToken || '')
  const fetchingRef = useRef<boolean>(false)
  const [initSessionLoading, setInitSessionLoading] = useState<boolean>(!sessionToken && !!tableId)
  
  // openManual là idempotent: bàn đang hiển thị ở đây nghĩa là phải đang OCCUPIED
  useEffect(() => {
    if (sessionToken || !tableId || fetchingRef.current) return;
    fetchingRef.current = true;
    
    let isMounted = true;
    const initSession = async () => {
      try {
        const res = await http.post<{data: {sessionToken: string}}>(API_ROUTES.posSession.openManual(tableId));
        if (isMounted) setSessionToken(res.data.data.sessionToken);
      } catch (err) {
        // fallback Error handling
      } finally {
        if (isMounted) {
            fetchingRef.current = false;
            setInitSessionLoading(false);
        }
      }
    };
    initSession();
    return () => { isMounted = false; };
  }, [tableId, sessionToken]);

  const { data: order, isLoading, refetch, isFetching } = usePosSessionOrder(sessionToken)
  const { mutate: cancelOrder, isPending: isCancelling } = usePosCancelOrder()
  const { mutate: cancelItem, isPending: isCancellingItem } = usePosCancelItem()
  const { mutate: returnItem, isPending: isReturningItem } = usePosReturnItem()
  const { mutate: requestPayment } = usePosRequestPayment()
  const { mutate: cancelTicket, isPending: isCancellingTicket } = usePosCancelTicket()
  
  const allItems = order?.tickets?.flatMap(t => t.items) || []
  const totalItems = allItems.length || 1
  const itemsDone = allItems.filter(i => (i.status?.toUpperCase() || '') === 'DONE' || (i.status?.toUpperCase() || '') === 'SERVED').length

  const handleCheckout = () => {
    if (!tableId || !sessionToken) return
    navigate(ROUTES.pos.payment.replace(':tableId', tableId), { state: { sessionToken } })
  }

  const handlePrint = () => {
    if (!sessionToken) return
    requestPayment(sessionToken)
  }

  const handleCancel = () => {
    if (!order) return
    cancelOrder(order.id, {
      onSuccess: () => navigate(ROUTES.pos.tables),
    })
  }

  const handleConfirmCancelItem = () => {
    if (!order || !cancelItemState) return
    cancelItem(
      { orderId: order.id, itemId: cancelItemState.itemId, reason: cancelItemState.reason },
      { onSuccess: () => setCancelItemState(null) }
    )
  }

  const handleConfirmReturnItem = () => {
    if (!order || !returnItemState) return
    returnItem(
      { orderId: order.id, itemId: returnItemState.itemId, reason: returnItemState.reason },
      { onSuccess: () => setReturnItemState(null) }
    )
  }

  const handleConfirmCancelTicket = () => {
    if (!order || !cancelTicketState) return
    cancelTicket(
      { orderId: order.id, ticketId: cancelTicketState.ticketId, reason: cancelTicketState.reason },
      { onSuccess: () => setCancelTicketState(null) }
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1)
              } else {
                navigate(ROUTES.pos.tables)
              }
            }}
            className="size-8 rounded-lg hover:bg-surface-variant transition-colors"
          >
            <ArrowLeft className="size-4 text-on-surface-variant" />
          </Button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black font-headline text-on-surface tracking-tight leading-none">
                {t('pos.orderDetail.title', { number: order?.tableNumber ?? '...' })}
              </h2>
              {order && <TicketStatusBadge status={order.status} />}
            </div>
            <p className="text-[10px] font-black text-outline uppercase tracking-widest flex items-center gap-1.5 opacity-80">
              {order ? t('pos.orderDetail.summary', { count: order.tickets.length, total: order.total.toLocaleString('vi-VN') }) : t('pos.orderDetail.loading')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="size-9 rounded-lg hover:bg-surface-variant transition-colors"
        >
          <RefreshCw className={`size-4 text-on-surface-variant ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      {/* Main Body - 2 Columns Layout (7:3) */}
      <div className="flex-1 overflow-hidden flex flex-row bg-surface-container-lowest/20">
        
        {/* Left Column: Ticket List (70%) */}
        <div className="flex-[7] overflow-y-auto p-4 space-y-4 border-r border-outline-variant/30 scrollbar-hide">
          {isLoading || initSessionLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : !order ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-outline">
              <AlertCircle className="size-10 opacity-30" />
              <p className="text-sm font-medium">{t('pos.orderDetail.notFound')}</p>
            </div>
          ) : order.tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
              <div className="size-20 rounded-full bg-surface-container flex items-center justify-center mb-6 shadow-inner">
                <ShoppingBag className="size-10 text-outline-variant" />
              </div>
              <h3 className="text-lg font-black text-on-surface uppercase tracking-tight mb-2">
                {t('pos.orderDetail.noOrder', 'Chưa có đơn hàng')}
              </h3>
              <p className="text-xs font-bold text-outline max-w-[240px] leading-relaxed">
                {t('pos.orderDetail.noTicketsHint', 'Hãy chọn thêm món từ menu để bắt đầu phiếu mới.')}
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate(`/pos/orders/new/${tableId}`)} className="rounded-xl px-6 mt-6">
                 {t('pos.orderDetail.addMore')}
              </Button>
            </div>
          ) : (
            order.tickets.map((ticket, idx) => (
              <TicketCard 
                 key={ticket.id} 
                 ticket={ticket} 
                 idx={idx} 
                 orderStatus={order.status}
                 onCancelItem={(itemId, name, status) => setCancelItemState({ itemId, name, status, reason: '' })}
                 onReturnItem={(itemId, name) => setReturnItemState({ itemId, name, reason: '' })}
                 onCancelTicket={(ticketId, index) => setCancelTicketState({ ticketId, index, reason: '' })}
              />
            ))
          )}
        </div>

        <aside className="flex-[3] min-w-[340px] bg-surface border-l border-outline-variant/50 flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
          {order ? (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest shrink-0">
               <div className="flex items-center gap-3">
                 <div className="size-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <ReceiptText className="size-4.5" />
                 </div>
                 <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em]">{t('pos.orderDetail.info_label', 'Chi tiết đơn hàng')}</h3>
               </div>
               <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${order.source === 'QR' ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-600' : 'bg-amber-500/5 border-amber-500/10 text-amber-600'}`}>
                  {order.source === 'QR' ? <Smartphone className="size-3" /> : <Keyboard className="size-3" />}
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    {order.source === 'QR' ? t('pos.orders.source.qr', 'QR Order') : t('pos.orders.source.pos', 'Manual')}
                  </span>
               </div>
              </div>
            
              <div className="p-5 space-y-5 overflow-y-auto scrollbar-hide">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">{t('pos.order.table', 'Số Bàn')}</span>
                    <span className="text-xs font-black text-on-surface">#{order.tableNumber}</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">{t('pos.order.time', 'Giờ vào')}</span>
                    <span className="text-xs font-black text-on-surface">{new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-outline-variant/30 space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-widest">{t('pos.orderDetail.progress', 'Tiến độ phục vụ')}</span>
                    <span className="text-[11px] font-black text-primary">{Math.round((itemsDone/totalItems)*100)}%</span>
                  </div>
                  <div className="space-y-3">
                     <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${(itemsDone/totalItems)*100}%` }}></div>
                     </div>
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter px-1">
                        <div className="flex items-center gap-1.5 text-success">
                           <div className="size-1.5 rounded-full bg-success"></div>
                           <span>{t('pos.orderDetail.items_done', 'Đã xong')}: {itemsDone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-orange-500">
                           <div className="size-1.5 rounded-full bg-orange-500"></div>
                           <span>{t('pos.orderDetail.items_pending', 'Chờ xử lý')}: {totalItems - itemsDone}</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/30 space-y-4">
                   <h4 className="px-1 text-[10px] font-black text-primary uppercase tracking-widest">{t('pos.orderDetail.tickets_list', 'Theo dõi phiếu món')}</h4>
                   <div className="space-y-2">
                      {order.tickets.map((ticket, idx) => (
                        <div key={ticket.id} className="flex justify-between items-center p-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20 hover:border-primary/30 transition-all cursor-default">
                          <span className="text-[10px] font-black text-on-surface uppercase">{t('pos.orderDetail.ticket', 'Phiếu #{{index}}', {index: idx + 1})}</span>
                          <span className="text-[10px] font-bold text-outline uppercase">{ticket.items.length} {t('pos.orderDetail.items_unit', 'món')}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="mt-auto p-6 bg-surface-container-lowest border-t border-outline-variant/40 space-y-5">
                <div className="space-y-2.5 px-1 font-sans">
                  <div className="flex justify-between text-[11px] font-black text-outline uppercase tracking-widest opacity-60">
                    <span>{t('pos.orderDetail.summary_label', 'Tạm tính')}</span>
                    <span className="tabular-nums">{(order.subtotal || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  {(order.discount || 0) > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-600 font-black uppercase tracking-widest">
                      <span>{t('pos.orderDetail.discount_label', 'Giảm giá')}</span>
                      <span className="tabular-nums">-{(order.discount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-4 border-t border-outline-variant/10">
                     <span className="text-xs font-black text-on-surface uppercase tracking-widest">{t('pos.payment.total', 'Tổng cộng')}</span>
                     <span className="text-3xl font-black text-primary font-headline tabular-nums tracking-tighter shadow-primary/5">{order.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Button 
                    variant="primary" 
                    className="w-full h-13 rounded-2xl shadow-xl shadow-primary/20 text-xs font-black uppercase tracking-wide flex items-center justify-center gap-3 transition-all active:scale-95"
                    onClick={handleCheckout}
                    disabled={order.status !== 'OPEN' && order.status !== 'PAYMENT_REQUESTED'}
                  >
                    <CreditCard className="size-4" />
                    {t('pos.orderDetail.checkout', 'Thanh toán')}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/pos/orders/new/${tableId}`)}
                      className="h-11 border text-[11px] font-black rounded-xl border-outline-variant bg-surface hover:border-primary hover:text-primary active:scale-[0.98] transition-all"
                    >
                      <ShoppingBag className="size-3.5 mr-2" /> 
                      {t('pos.orderDetail.addMore', 'Thêm món')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="h-11 border text-[11px] font-black rounded-xl border-outline-variant bg-surface hover:bg-surface-container active:scale-[0.98] transition-all"
                    >
                      <Printer className="size-3.5 mr-2" /> 
                      {t('pos.payment.printBtn', 'In Bill')}
                    </Button>
                  </div>
                  
                  {order.status === 'OPEN' && (() => {
                    const allItems = order.tickets.flatMap(t => t.items)
                    const hasDone = allItems.some(i => {
                      const s = i.status?.toUpperCase() || ''
                      return s === 'DONE' || s === 'COMPLETED' || s === 'SERVED'
                    })
                    
                    if (!hasDone) {
                      return (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          className="w-full text-[10px] font-black text-outline hover:text-error transition-colors pt-2"
                        >
                          {t('pos.orderDetail.cancelOrder', 'Huỷ toàn bộ đơn hàng')}
                        </button>
                      )
                    }
                    return <p className="text-[10px] font-bold text-error/60 text-center italic mt-2">{t('pos.orderDetail.rbac.orderHasDone', 'Đơn hàng đã có món hoàn thành. Vui lòng Huỷ món lẻ hoặc Trả món.')}</p>
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-6">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <div className="mt-auto pt-10">
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          )}
        </aside>
      </div>




      <ConfirmDialog
        isOpen={showCancelConfirm}
        title={t('pos.orderDetail.confirmCancel.title')}
        description={t('pos.orderDetail.confirmCancel.desc')}
        confirmText={t('pos.orderDetail.confirmCancel.confirm')}
        cancelText={t('pos.orderDetail.confirmCancel.cancel')}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
        variant="danger"
        isLoading={isCancelling}
      />

      {/* Cancel Item Modal */}
      {cancelItemState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelItemState(null)} />
          <div className="relative bg-surface rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">{t('pos.orderDetail.cancelItem.title', 'Huỷ món')}</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex-wrap">
              {t('pos.orderDetail.cancelItem.desc1', 'Bạn đang huỷ món ')} <span className="font-bold text-on-surface ml-1">{cancelItemState.name}</span>.
              {cancelItemState.status === 'PREPARING' || cancelItemState.status === 'DONE' 
                ? ' ' + t('pos.orderDetail.cancelItem.desc2', 'Món này đã được bếp xử lý, VUI LÒNG NHẬP LÝ DO:') 
                : ''}
            </p>
            
            <Input
              autoFocus
              placeholder={t('pos.orderDetail.cancelItem.placeholder', 'Nhập lý do huỷ (Tùy chọn nếu chưa làm)...')}
              value={cancelItemState.reason}
              onChange={e => setCancelItemState(prev => prev ? { ...prev, reason: e.target.value } : null)}
              className="mb-6 w-full"
            />
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setCancelItemState(null)} disabled={isCancellingItem}>
                {t('common.cancel', 'Hủy bỏ')}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 !bg-error hover:!bg-error/90 !text-on-error rounded-xl shadow-none border-none ring-0" 
                onClick={handleConfirmCancelItem}
                isLoading={isCancellingItem}
                disabled={!cancelItemState.reason.trim() && (cancelItemState.status === 'PREPARING' || cancelItemState.status === 'DONE')}
              >
                {t('pos.orderDetail.cancelItem.confirm', 'Xác nhận Huỷ')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return Item Modal */}
      {returnItemState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReturnItemState(null)} />
          <div className="relative bg-surface rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">{t('pos.orderDetail.returnItem.title', 'Hoàn Trả món đã lên / nấu xong')}</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex-wrap">
              {t('pos.orderDetail.returnItem.desc1', 'Thao tác sẽ trừ tiền món ')} <span className="font-bold text-on-surface ml-1">{returnItemState.name}</span> và khóa không cho tính phí.
            </p>
            
            <Input
              autoFocus
              placeholder={t('pos.orderDetail.returnItem.placeholder', 'Nhập lý do trả hàng bắt buộc...')}
              value={returnItemState.reason}
              onChange={e => setReturnItemState(prev => prev ? { ...prev, reason: e.target.value } : null)}
              className="mb-6 w-full"
            />
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setReturnItemState(null)} disabled={isReturningItem}>
                {t('common.cancel', 'Hủy bỏ')}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 !bg-amber-500 hover:!bg-amber-600 !text-white rounded-xl shadow-none border-none ring-0" 
                onClick={handleConfirmReturnItem}
                isLoading={isReturningItem}
                disabled={!returnItemState.reason.trim()}
              >
                <Undo2 className="size-4 mr-2" />
                {t('pos.orderDetail.returnItem.confirm', 'Xác nhận Hoàn Trả')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Ticket Modal */}
      {cancelTicketState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelTicketState(null)} />
          <div className="relative bg-surface rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">{t('pos.orderDetail.cancelTicket.title', 'Huỷ phiếu yêu cầu')}</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex-wrap">
              {t('pos.orderDetail.cancelTicket.desc1', 'Bạn đang huỷ toàn bộ phiếu #')} <span className="font-bold text-on-surface ml-1">{cancelTicketState.index + 1}</span>.
              {t('pos.orderDetail.cancelTicket.desc2', ' Thao tác này sẽ huỷ TẤT CẢ các món chưa làm trong phiếu này.')}
            </p>
            
            <Input
              autoFocus
              placeholder={t('pos.orderDetail.cancelTicket.placeholder', 'Nhập lý do huỷ phiếu (Tùy chọn)...')}
              value={cancelTicketState.reason}
              onChange={e => setCancelTicketState(prev => prev ? { ...prev, reason: e.target.value } : null)}
              className="mb-6 w-full"
            />
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setCancelTicketState(null)} disabled={isCancellingTicket}>
                {t('common.cancel', 'Hủy bỏ')}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 !bg-error hover:!bg-error/90 !text-on-error rounded-xl shadow-none border-none ring-0" 
                onClick={handleConfirmCancelTicket}
                isLoading={isCancellingTicket}
              >
                {t('pos.orderDetail.cancelTicket.confirm', 'Xác nhận Huỷ Phiếu')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
