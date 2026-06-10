import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { X, ScanQrCode, RefreshCw, Download, Ban } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left side: Form fields */}
            <div className="md:col-span-7 space-y-6">
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
                <NumberInput
                  label={t('admin.tables.drawer.capacity', 'Sức chứa')}
                  {...register('capacity', { valueAsNumber: true })}
                  min={1}
                  max={100}
                  error={errors.capacity as any}
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
                  {t('common.saveChanges', 'Lưu thay đổi')}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1 !rounded-2xl !py-3.5 !text-base border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all">
                  {t('common.cancel', 'Hủy')}
                </Button>
              </div>
            </div>

            {/* Right side: QR Preview & Actions */}
            {editingTable ? (
              <div className="md:col-span-5 bg-slate-50/80 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-slate-600 mb-4 uppercase tracking-wider text-center">{t('admin.tables.drawer.qrCurrent', 'QR Code Hiện Tại')}</p>
                <div className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center w-full aspect-square shrink-0 max-w-[160px] mb-5">
                  {editingTable.qrUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <QRCodeCanvas
                        id="qr-drawer-canvas"
                        value={editingTable.qrUrl}
                        size={140}
                        level="M"
                        marginSize={2}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 text-center flex flex-col items-center justify-center gap-2">
                      <ScanQrCode className="w-8 h-8 text-slate-300" />
                      <span className="font-medium">{t('admin.tables.drawer.qrEmpty', 'Chưa có QR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full mt-auto">
                  <Button variant="outline" type="button" isLoading={isGeneratingQr} onClick={() => generateQrMutation.mutate(editingTable.id)} className="w-full !px-3 !py-2 !rounded-lg !text-xs hover:!bg-white !bg-white/50 !border-slate-200 !text-slate-700 !shadow-sm justify-center">
                    <RefreshCw className="w-3 h-3 mr-1.5 shrink-0" />
                    <span className="font-semibold">{editingTable.qrUrl ? t('admin.tables.drawer.qrRegenerate', 'Tái tạo QR') : t('admin.tables.drawer.qrGenerate', 'Tạo mã QR')}</span>
                  </Button>
                  
                  <Button variant="outline" type="button" onClick={handleDownloadQr} disabled={!editingTable.qrUrl} className="w-full !px-3 !py-2 !rounded-lg !text-xs hover:!bg-white !bg-white/50 !border-slate-200 !text-slate-700 !shadow-sm disabled:opacity-50 justify-center">
                    <Download className="w-3 h-3 mr-1.5 shrink-0" />
                    <span className="font-semibold">{t('admin.tables.drawer.qrDownload', 'Tải QR')}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    type="button"
                    isLoading={isDisablingQr}
                    disabled={!editingTable.qrUrl}
                    onClick={() => disableQrMutation.mutate(editingTable.id)}
                    className="w-full !px-3 !py-2 !rounded-lg !text-xs hover:!bg-red-50 hover:!text-red-600 hover:!border-red-100 !bg-white/50 !border-slate-200 !text-slate-700 !shadow-sm disabled:opacity-50 justify-center"
                  >
                    <Ban className="w-3 h-3 mr-1.5 shrink-0" />
                    <span className="font-semibold">{t('admin.tables.drawer.qrDisable', 'Vô hiệu')}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="md:col-span-5 bg-slate-50/80 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center">
                <div className="text-center p-4 space-y-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                    <ScanQrCode className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-700">{t('admin.tables.qrPlaceholder.title', 'QR Code')}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[150px] mx-auto">
                      {t('admin.tables.qrPlaceholder.desc', 'Tạo bàn để tự động tạo mã QR Code cho khách hàng gọi món.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
