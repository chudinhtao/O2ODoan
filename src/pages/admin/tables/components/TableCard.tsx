import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { CheckCircle2, XCircle, Users, Download, RefreshCw, PencilLine, Trash2, Ban } from 'lucide-react'
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
        <div>
           <h3 className="text-2xl font-bold text-slate-800 ">{t('admin.tablesLabel', 'Bàn')} {table.number}</h3>
           {table.name && <p className="text-xs text-slate-500 font-medium mt-0.5">{table.name}</p>}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status?.dot || 'bg-slate-400'} mr-1.5`}></span>
          {status ? t(status.label, status.defaultText) : t('admin.tables.status.unknown', 'Không rõ')}
        </span>
      </div>
      <div className="space-y-3 mb-6 text-sm text-slate-600">
        <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
          <div className="flex items-center">
            {table.active ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400 mr-2" />
            )}
            <span className="font-medium">
              {table.active ? t('admin.tables.statusActive', 'Hoạt động') : t('admin.tables.statusInactive', 'Tạm ngưng')}
            </span>
          </div>
          <Toggle 
            checked={table.active} 
            onChange={() => onToggleActive(table.id)}
            disabled={isTogglingActive}
          />
        </div>

        <p className="flex items-center font-medium">
          <Users className="w-4 h-4 text-slate-400 mr-2" />
          <span>{table.capacity} {t('admin.tables.capacitySuffix', 'người')}</span>
        </p>

        <p className="flex items-center font-medium">
          {table.qrUrl ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400 mr-2" />
          )}
          <span>{t('admin.tables.qrField', 'Mã QR:')}{' '}
            <span className={table.qrUrl ? 'text-emerald-600' : 'text-slate-400'}>
              {table.qrUrl ? t('admin.tables.qrReady', 'Đã có mã') : t('admin.tables.qrEmpty', 'Chưa tạo')}
            </span>
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex space-x-1">
          <button onClick={handleDownloadQr} disabled={!table.qrUrl} className={`p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer ${!table.qrUrl ? 'opacity-50 cursor-not-allowed' : ''}`} title={t('admin.tables.drawer.qrDownload', 'Tải QR')}>
            <Download className="w-5 h-5" />
          </button>
          <button disabled={isGeneratingQr} onClick={() => onGenerateQr(table.id)} className={`p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer ${isGeneratingQr ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`} title={t('admin.tables.drawer.qrRegenerate', 'Tái tạo QR')}>
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => onEdit(table)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title={t('admin.tables.drawer.titleEdit', 'Sửa')}>
            <PencilLine className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(table)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer" title={t('admin.tables.archive', 'Lưu trữ')}>
            <Ban className="w-5 h-5" />
          </button>
          <button onClick={() => onHardDelete(table)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer" title={t('common.delete', 'Xoá vĩnh viễn')}>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      {table.qrUrl && (
        <div className="hidden">
          <QRCodeCanvas id={`qr-card-${table.id}`} value={table.qrUrl} size={1024} level="M" marginSize={2} />
        </div>
      )}
    </div>
  )
}

