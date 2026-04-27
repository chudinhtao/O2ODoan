import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { X, ScanQrCode, RefreshCw, Download, Ban } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { useCreateTable, useUpdateTable, useGenerateQr, useDisableQr } from '../hooks/useTables'
import type { ITable, ITableForm } from '../types/adminTable.type'

const tableSchema = z.object({
  number: z.union([z.number(), z.nan().transform(() => 0)])
    .pipe(z.number().min(1, 'admin.tables.validation.minNumber')),
  name: z.string().max(50, 'admin.tables.validation.maxName'),
  capacity: z.union([z.number(), z.nan().transform(() => 0)])
    .pipe(z.number().min(1, 'admin.tables.validation.minCapacity').max(100)),
  zone: z.string().max(50),
})

type TableFormSchema = z.infer<typeof tableSchema>

interface TableFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingTable: ITable | null
}

const defaultValues = { number: 1, name: '', capacity: 4, zone: '' }

export function TableFormModal({ isOpen, onClose, editingTable }: TableFormModalProps) {
  const { t } = useTranslation()
  const createMutation = useCreateTable()
  const updateMutation = useUpdateTable()
  const generateQrMutation = useGenerateQr()
  const disableQrMutation = useDisableQr()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TableFormSchema>({
    resolver: zodResolver(tableSchema),
    defaultValues,
    mode: 'onChange'
  })

  useEffect(() => {
    if (!isOpen) return
    reset(editingTable
      ? { number: editingTable.number, name: editingTable.name ?? '', capacity: editingTable.capacity, zone: editingTable.zone ?? '' }
      : defaultValues
    )
  }, [isOpen, editingTable, reset])

  const onSubmit = (data: TableFormSchema) => {
    const payload: ITableForm = { ...data, zone: data.zone ?? '' }
    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data: payload }, { onSuccess: onClose })
    } else {
      createMutation.mutate(payload, { onSuccess: onClose })
    }
  }

  if (!isOpen) return null

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isGeneratingQr = generateQrMutation.isPending
  const isDisablingQr = disableQrMutation.isPending

  const handleDownloadQr = () => {
    if (!editingTable?.qrUrl) return
    const canvas = document.getElementById('qr-drawer-canvas') as HTMLCanvasElement
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `table-${editingTable.number}-qr.png`
    a.click()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            {editingTable ? t('admin.tables.drawer.titleEdit', 'Cập nhật bàn') : t('admin.tables.drawer.titleAdd', 'Thêm bàn mới')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[85vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Form fields */}
            <div className="space-y-6">
              <Input
                label={t('admin.tables.drawer.name', 'Tên bàn (tuỳ chọn)')}
                {...register('name')}
                placeholder={t('admin.tables.drawer.namePlaceholder', 'VD: Bàn ngoài trời 1')}
                error={errors.name}
                className="!py-3"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label={t('admin.tables.drawer.number', 'Số bàn')}
                  {...register('number', { valueAsNumber: true })}
                  min={1}
                  error={errors.number}
                  className="!py-3"
                />
                <Select
                  label={t('admin.tables.drawer.capacity', 'Sức chứa')}
                  {...register('capacity', { valueAsNumber: true })}
                  error={errors.capacity as any}
                  options={[
                    { value: 2, label: t('admin.tables.capacity', { count: 2 }) },
                    { value: 4, label: t('admin.tables.capacity', { count: 4 }) },
                    { value: 6, label: t('admin.tables.capacity', { count: 6 }) },
                    { value: 8, label: t('admin.tables.capacity', { count: 8 }) }
                  ]}
                  className="!py-3"
                />
              </div>

              <Input
                label={t('admin.tables.drawer.zone', 'Khu vực')}
                {...register('zone')}
                placeholder={t('admin.tables.drawer.zonePlaceholder', 'VD: Tầng 1, Ban công, VIP...')}
                className="!py-3"
              />

              <div className="pt-8 flex gap-3">
                <Button type="button" isLoading={isSubmitting} onClick={handleSubmit(onSubmit)} className="flex-1 !rounded-2xl !py-3.5 !text-base bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  {t('common.save', 'Lưu thay đổi')}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 !rounded-2xl !py-3.5 !text-base border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all">
                  {t('common.cancel', 'Hủy')}
                </Button>
              </div>
            </div>

            {/* Right side: QR Preview (Only if editing or show placeholder) */}
            <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center">
              {editingTable ? (
                <>
                  <p className="text-sm font-bold text-slate-600 mb-6 uppercase tracking-wider">{t('admin.tables.drawer.qrCurrent', 'QR Code Hiện Tại')}</p>
                  <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 mb-6 flex items-center justify-center w-full max-w-[220px] aspect-square group relative">
                    {editingTable.qrUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <QRCodeCanvas
                          id="qr-drawer-canvas"
                          value={editingTable.qrUrl}
                          size={200}
                          level="M"
                          marginSize={2}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 text-center flex flex-col items-center justify-center gap-3">
                        <ScanQrCode className="w-12 h-12 text-slate-300" />
                        <span className="font-medium">{t('admin.tables.drawer.qrEmpty', 'Chưa có QR')}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 w-full gap-3 mt-auto">
                    <Button variant="outline" type="button" isLoading={isGeneratingQr} onClick={() => generateQrMutation.mutate(editingTable.id)} className="w-full !px-4 !py-3 !rounded-xl !text-sm hover:!bg-white !bg-white/50 !border-slate-200 !text-slate-700 !shadow-sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{t('admin.tables.drawer.qrRegenerate', 'Tái tạo QR')}</span>
                    </Button>
                    
                    {editingTable.qrUrl && (
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" type="button" onClick={handleDownloadQr} className="flex-1 !px-4 !py-3 !rounded-xl !text-sm hover:!bg-white !bg-white/50 !border-slate-200 !text-slate-700 !shadow-sm">
                          <Download className="w-4 h-4 mr-2" />
                          <span className="font-semibold">{t('admin.tables.drawer.qrDownload', 'Tải QR')}</span>
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          isLoading={isDisablingQr}
                          onClick={() => disableQrMutation.mutate(editingTable.id)}
                          className="flex-1 !px-4 !py-3 !rounded-xl !text-sm hover:!bg-red-50 hover:!text-red-600 hover:!border-red-100 !bg-white/50 !border-slate-200 !text-slate-700 !shadow-sm"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          <span className="font-semibold">{t('admin.tables.drawer.qrDisable', 'Vô hiệu')}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                    <ScanQrCode className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">{t('admin.tables.qrPlaceholder.title', 'QR Code')}</p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                      {t('admin.tables.qrPlaceholder.desc', 'Tạo bàn để tự động tạo mã QR Code cho khách hàng gọi món.')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
