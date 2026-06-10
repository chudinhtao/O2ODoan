import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { CheckCircle2, XCircle, Users, Download, RefreshCw, PencilLine, Trash2, Ban } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import type { ITable, TableStatus } from '../types/adminTable.type'
import { Toggle } from '@/shared/components/ui/Toggle'

interface TableCardProps {
  table: ITable
  onEdit: (table: ITable) => void
  onDelete: (table: ITable) => void
  onHardDelete: (table: ITable) => void
  onGenerateQr: (id: string) => void
  onToggleActive: (id: string) => void
  isGeneratingQr: boolean
  isTogglingActive: boolean
}

const STATUS_CONFIG: Record<TableStatus, { label: string; defaultText: string; cls: string; dot: string }> = {
  FREE: { label: 'admin.tables.status.free', defaultText: 'Trống', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  OCCUPIED: { label: 'admin.tables.status.occupied', defaultText: 'Đang phục vụ', cls: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  PAYMENT_REQUESTED: { label: 'admin.tables.status.waitingPayment', defaultText: 'Chờ thanh toán', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  CLEANING: { label: 'admin.tables.status.cleaning', defaultText: 'Đang dọn dẹp', cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  MERGED: { label: 'admin.tables.status.merged', defaultText: 'Đã ghép', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  RESERVED: { label: 'admin.tables.status.reserved', defaultText: 'Đã đặt', cls: 'bg-pink-50 text-pink-700 border-pink-200', dot: 'bg-pink-500' },
}

export function TableCard({
  table, onEdit, onDelete, onHardDelete,
  onGenerateQr, isGeneratingQr,
  onToggleActive, isTogglingActive
}: TableCardProps) {
  const { t } = useTranslation()
  const status = STATUS_CONFIG[table.status]

  const handleDownloadQr = () => {
    if (!table.qrUrl) return
    const canvas = document.getElementById(`qr-card-${table.id}`) as HTMLCanvasElement
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `table-${table.number}-qr.png`
    a.click()
  }

  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-primary/50 transition-all group ${!table.active ? 'opacity-75 grayscale-[0.2]' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
           <div className="size-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-700">
             {table.number}
           </div>
           <div>
             <h3 className="text-sm font-bold text-slate-800">{table.name || `${t('admin.tablesLabel', 'Bàn')} ${table.number}`}</h3>
             {table.zone && (
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block mt-1">
                 {table.zone}
               </p>
             )}
           </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${status.cls}`}>
            {status ? t(status.label, status.defaultText) : 'N/A'}
          </span>
          <Toggle 
            checked={table.active} 
            onChange={() => onToggleActive(table.id)}
            disabled={isTogglingActive}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 pt-2">
        <div className="flex items-center text-xs font-semibold text-slate-500">
          <Users className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
          {table.capacity} {t('admin.tables.capacitySuffix', 'người')}
        </div>
        
        {table.qrUrl ? (
          <div className="flex items-center text-[10px] font-bold text-emerald-600 uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            QR Ready
          </div>
        ) : (
          <div className="flex items-center text-[10px] font-bold text-slate-300 uppercase italic">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            No QR
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <button 
          onClick={handleDownloadQr} 
          disabled={!table.qrUrl} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${table.qrUrl ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer' : 'bg-slate-50/50 text-slate-300 cursor-not-allowed'}`}
        >
          <Download className="w-4 h-4" />
          {t('admin.tables.drawer.qrDownload', 'Tải QR')}
        </button>
        
        <DropdownMenu
          items={[
            {
              label: t('admin.tables.drawer.qrRegenerate', 'Tái tạo QR'),
              icon: <RefreshCw className={`w-4 h-4 ${isGeneratingQr ? 'animate-spin' : ''}`} />,
              onClick: () => onGenerateQr(table.id)
            },
            {
              label: t('admin.tables.drawer.titleEdit', 'Sửa bàn'),
              icon: <PencilLine className="w-4 h-4" />,
              onClick: () => onEdit(table)
            },
            {
              label: t('admin.tables.archive', 'Lưu trữ'),
              icon: <Ban className="w-4 h-4" />,
              onClick: () => onDelete(table)
            },
            {
              label: t('common.hardDelete', 'Xoá vĩnh viễn'),
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'danger',
              onClick: () => onHardDelete(table)
            }
          ]}
        />
      </div>
      {table.qrUrl && (
        <div className="hidden">
          <QRCodeCanvas id={`qr-card-${table.id}`} value={table.qrUrl} size={1024} level="M" marginSize={2} />
        </div>
      )}
    </div>
  )
}

