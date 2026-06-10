import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { useState } from 'react'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { useMutation } from '@tanstack/react-query'
import http from '@/services/interceptor'
import { PosHeader } from '@/layouts/components/PosHeader'

interface OrderEntryHeaderProps {
  tableId?: string;
  tables?: IPosTable[];
  actions?: React.ReactNode;
}

export function OrderEntryHeader({ tableId, tables, actions }: OrderEntryHeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tableSearch, setTableSearch] = useState('')

  const openManualMutation = useMutation({
    mutationFn: (id: string) => http.post(API_ROUTES.posSession.openManual(id)),
  })

  const handleChangeTable = async (val: string) => {
    if (!val) return // Người dùng bấm lại placeholder, không làm gì

    if (val === 'takeaway') {
      navigate('/pos/orders/new/takeaway')
      return
    }

    const selectedTbl = tables?.find(t => t.id === val)
    if (!selectedTbl) return

    if (selectedTbl.status === 'FREE' || selectedTbl.status === 'RESERVED') {
      try {
        await openManualMutation.mutateAsync(val)
        toast.success(t('pos.order.openedTable', `Đã mở bàn ${selectedTbl.number}`))
        navigate(`/pos/orders/new/${val}`)
      } catch {
        // Error is handled by interceptor
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
    // Placeholder đầu tiên khi chưa chọn bàn
    ...(!tableId ? [{ value: '', label: t('pos.order.selectTable', '-- Chọn bàn hoặc Mang về --') }] : []),
    { value: 'takeaway', label: t('pos.order.takeaway', 'Mang về') },
    ...(tables?.map(tbl => {
      let statusLabel = ''
      if (tbl.status === 'FREE') statusLabel = `(${t('pos.order.tableEmpty', 'Trống')})`
      else if (tbl.status === 'RESERVED') statusLabel = `(${t('pos.order.tableReserved', 'Đã đặt')})`
      else if (tbl.status === 'OCCUPIED') statusLabel = `(${t('pos.order.tableInUse', 'Đang dùng')})`
      else if (tbl.status === 'PAYMENT_REQUESTED') statusLabel = `(${t('pos.order.tableWaitPay', 'Chờ thanh toán')})`

      return {
        value: tbl.id,
        label: `${t('pos.order.table', 'Bàn')} ${tbl.number} ${statusLabel}`
      }
    }) || [])
  ]

  const filteredOptions = selectOptions.filter(opt => 
    opt.label.toLowerCase().includes(tableSearch.toLowerCase())
  )

  return (
    <div className="z-30 shadow-sm relative">
      <PosHeader
        hideStaffCall
        title={
          <div className="flex items-center gap-3">
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
                className="size-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-all active:scale-90"
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {t('pos.order.orderLabel', 'Đặt Hàng:')}
              </h2>
              <div className="w-64">
                <AsyncSelect
                  className="font-bold border-slate-200 focus:border-primary"
                  value={tableId === 'takeaway' ? 'takeaway' : (tableId || '')}
                  onChange={(val) => handleChangeTable(val.toString())}
                  onSearch={setTableSearch}
                  options={filteredOptions}
                />
              </div>
            </div>
          </div>
        }
        actions={actions}
      />
    </div>
  )
}


