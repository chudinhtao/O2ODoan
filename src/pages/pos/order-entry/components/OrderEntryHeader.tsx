import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { useMutation } from '@tanstack/react-query'
import http from '@/services/interceptor'

interface OrderEntryHeaderProps {
  tableId?: string;
  tables?: IPosTable[];
}

export function OrderEntryHeader({ tableId, tables }: OrderEntryHeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const openManualMutation = useMutation({
    mutationFn: (id: string) => http.post(API_ROUTES.posSession.openManual(id)),
  })

  const handleChangeTable = async (val: string) => {
    if (val === 'takeaway') {
      navigate('/pos/orders/new/takeaway')
      return
    }

    const selectedTbl = tables?.find(t => t.id === val)
    if (!selectedTbl) return

    if (selectedTbl.status === 'FREE') {
      try {
        await openManualMutation.mutateAsync(val)
        toast.success(t('pos.order.openedTable', `Đã mở bàn ${selectedTbl.number}`))
        navigate(`/pos/orders/new/${val}`)
      } catch {
        toast.error(t('pos.order.openError', 'Lỗi khi mở bàn!'))
      }
    } else if (selectedTbl.status === 'OCCUPIED') {
      navigate(`/pos/orders/new/${val}`)
    } else if (selectedTbl.status === 'PAYMENT_REQUESTED') {
      toast.error(t('pos.order.paymentPending', 'Bàn đang chờ thanh toán, hãy xử lý thanh toán trước!'))
    } else {
      toast.error(t('pos.order.statusError', 'Bàn đang ở trạng thái lỗi, không thể thao tác!'))
    }
  }

  const selectOptions = [
    { value: 'takeaway', label: t('pos.order.takeaway', 'Mang về') },
    ...(tables?.map(tbl => {
      let statusLabel = ''
      if (tbl.status === 'FREE') statusLabel = `(${t('pos.order.tableEmpty', 'Trống')})`
      else if (tbl.status === 'OCCUPIED') statusLabel = `(${t('pos.order.tableInUse', 'Đang dùng')})`
      else if (tbl.status === 'PAYMENT_REQUESTED') statusLabel = `(${t('pos.order.tableWaitPay', 'Chờ thanh toán')})`

      return {
        value: tbl.id,
        label: `${t('pos.order.table', 'Bàn')} ${tbl.number} ${statusLabel}`
      }
    }) || [])
  ]

  return (
    <header className="h-18 shrink-0 border-b border-outline-variant flex items-center px-6 bg-surface-bright shadow-sm z-10">
      {tableId && tableId !== 'takeaway' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1)
            } else {
              navigate('/pos/tables')
            }
          }}
          className="mr-4 text-outline hover:bg-surface-variant"
        >
          <ArrowLeft className="size-5" />
        </Button>
      )}
      
      <div className="flex-1 flex items-center gap-4 border-none">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-on-surface uppercase tracking-tight">
            {t('pos.order.orderLabel', 'Đặt Hàng:')}
          </h2>
          <div className="w-64">
            <Select
              className="font-bold border-outline-variant focus:border-primary"
              value={!tableId || tableId === 'takeaway' ? 'takeaway' : tableId}
              onChange={(e) => handleChangeTable(e.target.value)}
              options={selectOptions}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

