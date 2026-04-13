import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { X, Clock, MonitorSmartphone, ReceiptText, Ban } from 'lucide-react'
import { useOrderDetails, useOrderMutations } from '../hooks/useOrders'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'

interface Props {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailModal({ orderId, isOpen, onClose }: Props) {
  const { t } = useTranslation()
  const { data: order, isLoading } = useOrderDetails(orderId)
  const { cancelMutation } = useOrderMutations()
  const [showCancelParams, setShowCancelParams] = useState(false)

  if (!isOpen) return null

  const handleCancelOrder = () => {
    if (!orderId) return
    cancelMutation.mutate(
      { id: orderId, reason: t('admin.orders.drawer.cancelReason') },
      { onSuccess: () => {
          setShowCancelParams(false)
          onClose()
        }
      }
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <ReceiptText className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {t('admin.orders.drawer.title')}
              </h3>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {t('admin.orders.table.id')}: <span className="text-slate-900 font-black">#{order?.id?.slice(-8).toUpperCase() || '...'}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          {isLoading || !order ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full !rounded-2xl" />
              <Skeleton className="h-40 w-full !rounded-2xl" />
              <Skeleton className="h-32 w-full !rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('admin.orders.drawer.createdAtLabel')}</span>
                      <span className="text-sm font-bold text-slate-800">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <MonitorSmartphone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('admin.orders.drawer.sourceLabel')}</span>
                      <span className="text-sm font-bold text-slate-800">
                        {order.source === 'MANUAL' ? t('admin.orders.source.pos') : t('admin.orders.source.qr')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden relative">
                   <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{t('admin.orders.table.table')}</span>
                    <span className="text-4xl font-black text-primary">{order.tableNumber || '-'}</span>
                   </div>
                   
                   <div className="mt-4 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${
                      order.status === 'PAID' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-600 border border-red-200' :
                      'bg-sky-100 text-sky-600 border border-sky-200'
                    }`}>
                      <div className={`size-1.5 rounded-full ${
                         order.status === 'PAID' ? 'bg-emerald-500' :
                         order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-sky-500'
                      }`} />
                      {t(`admin.orders.status.${order.status.toLowerCase()}`)}
                    </span>
                  </div>

                  <ReceiptText className="absolute -bottom-4 -right-4 size-24 text-slate-50 opacity-10" />
                </div>
              </div>

              {/* Tickets & Items */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[2px] px-1">{t('admin.orders.drawer.summary')}</h4>
                
                <div className="space-y-4">
                  {order.tickets.map((ticket, idx) => (
                    <div key={ticket.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('admin.orders.drawer.callNumber', { number: idx + 1 })}</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                          <Clock size={12} />
                          {new Date(ticket.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                      <div className="p-4 divide-y divide-slate-50">
                        {ticket.items.map((item) => (
                          <div key={item.id} className="py-3 first:pt-0 last:pb-0 group">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4 min-w-0">
                                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-slate-600 text-sm border border-slate-100 shrink-0">
                                  {item.quantity}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">{item.itemName}</p>
                                  {item.options?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {item.options.map((o, i) => (
                                        <span key={i} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{o.optionName}</span>
                                      ))}
                                    </div>
                                  )}
                                  {item.note && (
                                    <p className="text-[10px] text-red-500 mt-2 font-bold italic bg-red-50 px-2 py-1 rounded-lg border border-red-100 inline-block">“{item.note}”</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-slate-800">
                                  {(item.unitPrice * item.quantity).toLocaleString()}đ
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && order && (
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-6 shrink-0 mt-auto">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase tracking-widest">{t('admin.orders.drawer.subtotal')}</span>
                <span className="font-bold">{order.subtotal.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-slate-800 uppercase tracking-tighter">{t('admin.orders.drawer.total')}</span>
                <span className="text-3xl font-black text-primary tracking-tighter shadow-primary/10">{order.total.toLocaleString()}đ</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              {order.status === 'OPEN' && (
                <Button
                  variant="danger"
                  onClick={() => setShowCancelParams(true)}
                  className="flex-1 py-4 px-6 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  <Ban className="w-5 h-5" />
                  {t('admin.orders.drawer.cancelOrder')}
                </Button>
              )}
              <Button
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-800 text-white font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
              >
                {t('admin.orders.drawer.close')}
              </Button>
            </div>
          </div>
        )}

      </div>

      <ConfirmDialog
        isOpen={showCancelParams}
        title={t('admin.orders.cancelPrompt.title')}
        description={t('admin.orders.cancelPrompt.message', { id: order?.id?.slice(-6).toUpperCase() })}
        confirmText={t('admin.orders.cancelPrompt.confirm')}
        cancelText={t('admin.orders.cancelPrompt.cancel')}
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelParams(false)}
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
