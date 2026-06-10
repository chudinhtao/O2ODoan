import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Calendar, Clock, Users, Phone, User, Ban, XCircle, FileEdit, Coffee, Banknote, Copy, ExternalLink, QrCode } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IReservation } from '@/shared/types/reservation'
import { usePosMenuItems } from '@/pages/pos/order-entry/hooks/usePosMenu'
import { ITicketItemRequest } from '@/pages/customer/menu/types'
import { Button } from '@/shared/components/ui/Button'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Select } from '@/shared/components/ui/Select'
import { Badge } from '@/shared/components/ui/Badge'
import { Input } from '@/shared/components/ui/Input'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { posReservationService } from '../services/posReservation.service'

interface ReservationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: IReservation | null
  onUpdateStatus: (id: string, status: 'CANCELLED' | 'NO_SHOW', reason?: string, refundStatus?: string) => void
  onEditClick: (res: IReservation) => void
  isUpdating: boolean
  hideEditButton?: boolean
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-slate-200 text-slate-700'
}

// We will translate these keys dynamically using t('pos.reservations.status.X')
// We will translate these keys dynamically using t('pos.reservations.status.X')

export function ReservationDetailModal({ isOpen, onClose, reservation, onUpdateStatus, onEditClick, isUpdating, hideEditButton }: ReservationDetailModalProps) {
  const { t } = useTranslation()
  const [cancelReason, setCancelReason] = useState('')
  const [refundStatus, setRefundStatus] = useState('NOT_REQUIRED')
  const [showCancelPrompt, setShowCancelPrompt] = useState(false)
  const [confirmNoShowOpen, setConfirmNoShowOpen] = useState(false)
  const [depositLink, setDepositLink] = useState<string | null>(null)
  const [depositAmountInput, setDepositAmountInput] = useState<number>(200000)
  const { data: allItems } = usePosMenuItems()

  useEffect(() => {
    if (isOpen) {
      setCancelReason('')
      setRefundStatus('NOT_REQUIRED')
      setShowCancelPrompt(false)
      setDepositLink(null)
      setDepositAmountInput(200000)
    }
  }, [isOpen])

  const createDepositLinkMutation = useMutation({
    mutationFn: () => {
      const redirectUrl = window.location.origin + '/booking'
      return posReservationService.createDepositLink(reservation!.id, redirectUrl, depositAmountInput)
    },
    onSuccess: (res) => {
      if (res.checkoutUrl) {
        setDepositLink(res.checkoutUrl)
        toast.success(t('pos.reservations.depositLinkSuccess', 'Tạo link cọc thành công!'))
      }
    },
    onError: (err: any) => {
      const backendError = err?.response?.data?.error
      toast.error(backendError || t('pos.reservations.depositLinkError', 'Không thể tạo link cọc PayOS.'))
    }
  })

  if (!isOpen || !reservation) return null

  let parsedItems: ITicketItemRequest[] = []
  try {
    if (reservation.preOrderDraft) {
      parsedItems = JSON.parse(reservation.preOrderDraft)
    }
  } catch (e) {
    console.error("Invalid preOrderDraft JSON", e)
  }

  const handleCancelSubmit = () => {
    onUpdateStatus(reservation.id, 'CANCELLED', cancelReason, refundStatus)
    setShowCancelPrompt(false)
    setCancelReason('')
    setRefundStatus('NOT_REQUIRED')
  }

  const handleNoShow = () => {
    setConfirmNoShowOpen(true)
  }

  const confirmNoShow = () => {
    onUpdateStatus(reservation.id, 'NO_SHOW')
    setConfirmNoShowOpen(false)
  }

  const isActive = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED'

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-100">
          <h2 className="font-black text-xl text-slate-800">{t('pos.reservations.detailTitle', 'Chi tiết Đặt Bàn')}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-slate-200/50 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="flex items-center justify-between">
            <Badge className={`ml-3 border-none px-3 py-1 ${statusColors[reservation.status] || 'bg-slate-100 text-slate-700'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 inline-block"></span>
              {t(`pos.reservations.status.${reservation.status}`, reservation.status)}
            </Badge>
            {reservation.assignedTableNumbers && reservation.assignedTableNumbers.length > 0 && (
              <div className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                {t('pos.reservations.table.table', 'Bàn')}: {reservation.assignedTableNumbers.join(', ')}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('pos.reservations.customerLabel', 'Khách hàng')}</p>
                <p className="font-black text-slate-800 text-lg">{reservation.customerName}</p>
                <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1.5"><Phone size={14} /> {reservation.customerPhone}</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={14} /> {t('pos.reservations.arrivalDate', 'Ngày đến')}</p>
                <p className="font-bold text-slate-700">{format(parseISO(reservation.bookingTime), 'dd/MM/yyyy')}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={14} /> {t('pos.reservations.arrivalTime', 'Giờ đến')}</p>
                <p className="font-bold text-slate-700">{format(parseISO(reservation.bookingTime), 'HH:mm')}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Users size={14} /> {t('pos.reservations.form.partySize', 'Số lượng')}</p>
                <p className="font-bold text-slate-700">
                  {reservation.partySize} {t('pos.reservations.guests', 'khách')}
                  <span className="text-xs font-medium text-slate-500 ml-1 block mt-0.5">
                    ({reservation.adultCount || reservation.partySize} {t('pos.reservations.adults', 'Người lớn')}{reservation.childrenCount ? `, ${reservation.childrenCount} ${t('pos.reservations.children', 'Trẻ em')}` : ''})
                  </span>
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Coffee size={14} /> {t('pos.reservations.preorderLabel', 'Đặt trước')}</p>
                <p className={`font-bold ${reservation.preOrderDraft ? 'text-orange-600' : 'text-slate-400'}`}>
                  {reservation.preOrderDraft ? t('pos.reservations.hasPreorder', 'Có món đặt trước') : t('pos.reservations.noPreorder', 'Không')}
                </p>
              </div>
            </div>

            {reservation.note && (
              <>
                <div className="h-px bg-slate-200 w-full" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('common.note', 'Ghi chú')}</p>
                  <p className="text-sm font-medium text-slate-700 italic">{reservation.note}</p>
                </div>
              </>
            )}

              <>
                <div className="h-px bg-slate-200 w-full" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Banknote size={14} /> {t('pos.reservations.deposit', 'Tiền cọc')}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {(reservation.depositAmount || 0) > 0 ? (
                        <p className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-lg">
                          {new Intl.NumberFormat('vi-VN').format(reservation.depositAmount)}đ
                        </p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                            {t('pos.reservations.noDeposit', 'Không cọc (0đ)')}
                          </p>
                          {reservation.status === 'PENDING' && !depositLink && (
                            <div className="flex items-center gap-2 ml-2">
                              <div className="w-28">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1000"
                                  value={depositAmountInput || ''}
                                  onChange={(e) => setDepositAmountInput(Number(e.target.value))}
                                  className="h-8 text-xs bg-slate-50 focus:bg-white !px-3"
                                  placeholder={t('pos.reservations.enterAmount', 'Nhập số tiền')}
                                />
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 shadow-none px-3 shrink-0 whitespace-nowrap"
                                isLoading={createDepositLinkMutation.isPending}
                                onClick={() => createDepositLinkMutation.mutate()}
                              >
                                <QrCode size={14} className="mr-1.5" />
                                {t('pos.reservations.generateDepositLink', 'Tạo link')}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      {reservation.status === 'CANCELLED' && (reservation.depositAmount || 0) > 0 && (
                        <Badge variant={reservation.refundStatus === 'REFUNDED' ? 'info' : reservation.refundStatus === 'PENDING_REFUND' ? 'warning' : 'neutral'}>
                          {reservation.refundStatus === 'REFUNDED' ? t('pos.reservations.refund.refunded', 'Đã hoàn tiền') :
                           reservation.refundStatus === 'PENDING_REFUND' ? t('pos.reservations.refund.pending', 'Chờ kế toán hoàn tiền') : t('pos.reservations.refund.none', 'Không hoàn tiền')}
                        </Badge>
                      )}
                    </div>
                    {depositLink && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50/50 border border-blue-100 rounded-lg mt-1">
                        <input 
                          type="text" 
                          readOnly 
                          value={depositLink} 
                          className="flex-1 text-xs bg-transparent border-none outline-none text-slate-600 px-1 truncate" 
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(depositLink)
                            toast.success(t('common.copied', 'Đã copy vào bộ nhớ tạm'))
                          }}
                          className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                          title={t('common.copyLink', 'Copy Link')}
                        >
                          <Copy size={14} />
                        </button>
                        <a 
                          href={depositLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                          title={t('common.openLink', 'Mở link')}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
          </div>

          {parsedItems.length > 0 && (
            <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Coffee className="text-orange-500" size={18} />
                {t('pos.reservations.preorder.listTitle', 'Danh sách Món Đặt Trước')}
              </h4>
              <div className="space-y-3">
                {parsedItems.map((item, idx) => {
                  const menuItem = allItems?.find(m => m.id === item.menuItemId)
                  if (!menuItem) return null
                  return (
                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100/50 flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-slate-800">{item.quantity}x {menuItem.name}</div>
                        {item.options && item.options.length > 0 && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.options.map(o => {
                              let optName = t('pos.reservations.preorder.option', 'Tùy chọn')
                              menuItem.optionGroups?.forEach(g => {
                                g.options?.forEach(opt => {
                                  if (opt.id === o.optionId) optName = opt.name
                                })
                              })
                              return optName
                            }).join(', ')}
                          </div>
                        )}
                        {item.note && <div className="text-[11px] text-orange-500 italic mt-0.5">{t('pos.reservations.preorder.noteLabel', 'Ghi chú: {{note}}', { note: item.note })}</div>}
                      </div>
                      <div className="font-bold text-sm text-primary">
                        {new Intl.NumberFormat('vi-VN').format(menuItem.basePrice * item.quantity)}đ
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cancel Inputs in Body */}
          {showCancelPrompt && (
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100 space-y-4 animate-in fade-in slide-in-from-top-4">
              <h4 className="font-bold text-red-800 text-sm flex items-center gap-2">
                <XCircle size={18} className="shrink-0" />
                {t('pos.reservations.confirm_cancel', 'Xác nhận hủy đặt bàn')}
              </h4>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t('pos.reservations.cancel_reason', 'Lý do hủy')}
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder={t('pos.reservations.cancel_reason_placeholder', 'Nhập lý do hủy (Tùy chọn)...')}
                  className="bg-white border-red-200 focus-visible:ring-red-300"
                  rows={3}
                />
              </div>
              
              {(reservation.depositAmount ?? 0) > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t('pos.reservations.refund_status', 'Tình trạng hoàn cọc')}
                  </label>
                  <Select
                    value={refundStatus}
                    onChange={(e) => setRefundStatus(e.target.value)}
                    placement="top"
                    className="!bg-white !border-red-200 !text-slate-700"
                    options={[
                      { value: "NOT_REQUIRED", label: t('pos.reservations.refund.not_required', 'Không cần hoàn (Khách bùng bàn)') },
                      { value: "PENDING_REFUND", label: t('pos.reservations.refund.pending', 'Chờ Kế toán hoàn tiền') },
                      { value: "REFUNDED", label: t('pos.reservations.refund.refunded', 'Đã chuyển khoản hoàn tiền') }
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(isActive || showCancelPrompt) && (
          <div className="bg-white border-t border-slate-100 p-6 shrink-0">
            {/* Actions Section */}
            {isActive && !showCancelPrompt && (
              <div className={`grid gap-3 ${hideEditButton ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {!hideEditButton && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onEditClick(reservation); }}
                    className="flex flex-col items-center justify-center p-3 h-auto rounded-xl bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20 border-none transition-all active:scale-95"
                  >
                    <FileEdit size={20} className="mb-1" />
                    <span className="text-xs font-bold">{t('pos.reservations.edit', 'Chỉnh sửa')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNoShow}
                  disabled={isUpdating}
                  className="flex flex-col items-center justify-center p-3 h-auto rounded-xl bg-slate-500 text-white hover:bg-slate-600 shadow-sm shadow-slate-500/20 border-none transition-all active:scale-95 disabled:opacity-50"
                >
                  <Ban size={20} className="mb-1" />
                  <span className="text-xs font-bold">{t('pos.reservations.no_show', 'Không đến')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(true)}
                  className="flex flex-col items-center justify-center p-3 h-auto rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 border-none transition-all active:scale-95"
                >
                  <XCircle size={20} className="mb-1" />
                  <span className="text-xs font-bold">{t('pos.reservations.cancel', 'Hủy bàn')}</span>
                </button>
              </div>
            )}

            {/* Cancel Action Buttons only */}
            {showCancelPrompt && (
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {t('pos.reservations.back', 'Quay lại')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelSubmit}
                  isLoading={isUpdating}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 transition-all active:scale-95"
                >
                  {t('pos.reservations.confirm', 'Đồng ý hủy')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmNoShowOpen}
        title={t('pos.reservations.action.noShow', 'Đánh dấu Không đến')}
        description={t('pos.reservations.confirmNoShow', 'Bạn có chắc khách hàng này không đến?')}
        onConfirm={confirmNoShow}
        onCancel={() => setConfirmNoShowOpen(false)}
        variant="warning"
        isLoading={isUpdating}
      />
    </div>
  )
}
